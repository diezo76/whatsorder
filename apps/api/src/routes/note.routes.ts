import { Router } from 'express';
import { noteController } from '@/controllers/note.controller';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

// Toutes les routes sont protégées par authMiddleware
router.use(authMiddleware);

// PUT /api/notes/:id - Met à jour une note existante
router.put('/notes/:id', noteController.updateNote.bind(noteController));

// DELETE /api/notes/:id - Supprime une note
router.delete('/notes/:id', noteController.deleteNote.bind(noteController));

export default router;
