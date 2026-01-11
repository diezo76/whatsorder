import { Router } from 'express';
import { menuController } from '@/controllers/menu.controller';
import { categoryController } from '@/controllers/category.controller';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

// Toutes les routes sont protégées par authMiddleware
router.use(authMiddleware);

// ==========================================
// ROUTES ITEMS
// ==========================================

// GET /api/menu/items - Liste tous les items avec filtres optionnels
router.get('/items', menuController.getMenuItems.bind(menuController));

// GET /api/menu/items/:id - Récupère un item par ID
router.get('/items/:id', menuController.getMenuItem.bind(menuController));

// POST /api/menu/items - Crée un nouvel item
router.post('/items', menuController.createMenuItem.bind(menuController));

// PUT /api/menu/items/:id - Met à jour un item existant
router.put('/items/:id', menuController.updateMenuItem.bind(menuController));

// DELETE /api/menu/items/:id - Supprime un item (soft delete)
router.delete('/items/:id', menuController.deleteMenuItem.bind(menuController));

// PATCH /api/menu/items/:id/toggle-availability - Toggle isAvailable d'un item
router.patch('/items/:id/toggle-availability', menuController.toggleItemAvailability.bind(menuController));

// ==========================================
// ROUTES CATEGORIES
// ==========================================

// GET /api/menu/categories - Liste toutes les catégories du restaurant
router.get('/categories', categoryController.getCategories.bind(categoryController));

// GET /api/menu/categories/:id - Récupère une catégorie par ID
router.get('/categories/:id', categoryController.getCategory.bind(categoryController));

// POST /api/menu/categories - Crée une nouvelle catégorie
router.post('/categories', categoryController.createCategory.bind(categoryController));

// PUT /api/menu/categories/:id - Met à jour une catégorie
router.put('/categories/:id', categoryController.updateCategory.bind(categoryController));

// DELETE /api/menu/categories/:id - Supprime une catégorie (soft delete)
router.delete('/categories/:id', categoryController.deleteCategory.bind(categoryController));

// PATCH /api/menu/categories/reorder - Réordonne les catégories
router.patch('/categories/reorder', categoryController.reorderCategories.bind(categoryController));

export default router;
