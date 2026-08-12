import { Router } from 'express';
import {
  validateUserCreate,
  validateUserUpdate,
  validateUserId,
  validateListQuery
} from '../middlewares/validate';
import {
  listUsers,
  getUserDetails,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = Router();

// Base path: /api/v1/users
router
  .route('/')
  .post(validateUserCreate, createUser)
  .get(validateListQuery, listUsers);

router
  .route('/:id')
  .get(validateUserId, getUserDetails)
  .put(validateUserId, validateUserUpdate, updateUser)
  .delete(validateUserId, deleteUser);

export default router;
