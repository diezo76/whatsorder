import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/prisma';
import { AuthRequest } from '@/middleware/auth.middleware';
import { getIoInstance } from '@/utils/socket';

// Schéma de validation Zod pour createNote
const createNoteSchema = z.object({
  content: z.string().min(1, 'Le contenu de la note est requis').max(2000, 'La note ne peut pas dépasser 2000 caractères'),
});

// Schéma de validation Zod pour updateNote
const updateNoteSchema = z.object({
  content: z.string().min(1, 'Le contenu de la note est requis').max(2000, 'La note ne peut pas dépasser 2000 caractères'),
});

export class NoteController {
  /**
   * Récupère toutes les notes d'une conversation
   */
  async getNotes(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: 'ID de la conversation requis' });
      }

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que la conversation existe et appartient au restaurant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          restaurantId: user.restaurantId,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Récupérer toutes les notes de la conversation
      const notes = await prisma.internalNote.findMany({
        where: {
          conversationId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = notes.length;

      res.json({
        notes,
        total,
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des notes:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération des notes' });
    }
  }

  /**
   * Crée une note interne sur une conversation
   */
  async createNote(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: 'ID de la conversation requis' });
      }

      // Validation avec Zod
      const validationResult = createNoteSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const { content } = validationResult.data;

      // Récupérer l'utilisateur pour obtenir son restaurantId
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { restaurantId: true },
      });

      if (!user || !user.restaurantId) {
        return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
      }

      // Vérifier que la conversation existe et appartient au restaurant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          restaurantId: user.restaurantId,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      // Créer la note
      const note = await prisma.internalNote.create({
        data: {
          content,
          conversationId,
          userId: req.user.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Émettre un événement Socket.io dans la room de la conversation
      const io = getIoInstance();
      if (io) {
        io.to(`conversation_${conversationId}`).emit('note_added', note);
        console.log(`Note added event emitted to conversation: ${conversationId}`);
      }

      res.status(201).json(note);
    } catch (error: any) {
      console.error('Erreur lors de la création de la note:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la création de la note' });
    }
  }

  /**
   * Met à jour une note existante
   */
  async updateNote(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de la note requis' });
      }

      // Validation avec Zod
      const validationResult = updateNoteSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }

      const { content } = validationResult.data;

      // Récupérer la note existante
      const existingNote = await prisma.internalNote.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      if (!existingNote) {
        return res.status(404).json({ error: 'Note non trouvée' });
      }

      // Vérifier que l'auteur est le user connecté
      if (existingNote.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Non autorisé : vous n\'êtes pas l\'auteur de cette note' });
      }

      // Mettre à jour la note
      const note = await prisma.internalNote.update({
        where: { id },
        data: {
          content,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Émettre un événement Socket.io si la note est liée à une conversation
      if (note.conversationId) {
        const io = getIoInstance();
        if (io) {
          io.to(`conversation_${note.conversationId}`).emit('note_updated', note);
          console.log(`Note updated event emitted to conversation: ${note.conversationId}`);
        }
      }

      res.json(note);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Note non trouvée' });
      }

      res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour de la note' });
    }
  }

  /**
   * Supprime une note
   */
  async deleteNote(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID de la note requis' });
      }

      // Récupérer la note existante
      const existingNote = await prisma.internalNote.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });

      if (!existingNote) {
        return res.status(404).json({ error: 'Note non trouvée' });
      }

      // Vérifier que l'auteur est le user connecté OU que l'utilisateur est OWNER/MANAGER
      const isAuthor = existingNote.userId === req.user.userId;
      const isOwnerOrManager = req.user.role === 'OWNER' || req.user.role === 'MANAGER';

      if (!isAuthor && !isOwnerOrManager) {
        return res.status(403).json({ error: 'Non autorisé : vous ne pouvez supprimer que vos propres notes' });
      }

      const conversationId = existingNote.conversationId;

      // Supprimer la note
      await prisma.internalNote.delete({
        where: { id },
      });

      // Émettre un événement Socket.io si la note était liée à une conversation
      if (conversationId) {
        const io = getIoInstance();
        if (io) {
          io.to(`conversation_${conversationId}`).emit('note_deleted', { id, conversationId });
          console.log(`Note deleted event emitted to conversation: ${conversationId}`);
        }
      }

      res.json({ message: 'Note supprimée avec succès' });
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la note:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Note non trouvée' });
      }

      res.status(500).json({ error: error.message || 'Erreur lors de la suppression de la note' });
    }
  }
}

export const noteController = new NoteController();
