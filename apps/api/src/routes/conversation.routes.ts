import { Router } from 'express';
import { conversationController } from '@/controllers/conversation.controller';
import { noteController } from '@/controllers/note.controller';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

// Toutes les routes sont protégées par authMiddleware
router.use(authMiddleware);

// GET /api/conversations - Liste toutes les conversations du restaurant
router.get('/', conversationController.getConversations.bind(conversationController));

// POST /api/conversations/:id/messages - Envoie un message dans une conversation
// IMPORTANT: Cette route doit être avant /:id pour éviter les conflits
router.post('/:id/messages', conversationController.sendMessage.bind(conversationController));

// GET /api/conversations/:id/messages - Récupère tous les messages d'une conversation
router.get('/:id/messages', conversationController.getMessages.bind(conversationController));

// GET /api/conversations/:conversationId/notes - Récupère toutes les notes d'une conversation
// IMPORTANT: Cette route doit être avant /:id pour éviter les conflits
router.get('/:conversationId/notes', noteController.getNotes.bind(noteController));

// POST /api/conversations/:conversationId/notes - Crée une note interne sur une conversation
router.post('/:conversationId/notes', noteController.createNote.bind(noteController));

// GET /api/conversations/:id - Récupère une conversation par ID
// IMPORTANT: Cette route doit être en dernier pour éviter les conflits avec les routes spécifiques
router.get('/:id', conversationController.getConversation.bind(conversationController));

// PATCH /api/conversations/:id/mark-read - Marque tous les messages comme lus
router.patch('/:id/mark-read', conversationController.markAsRead.bind(conversationController));

// PATCH /api/conversations/:id/archive - Archive/désarchive une conversation
router.patch('/:id/archive', conversationController.archiveConversation.bind(conversationController));

export default router;
