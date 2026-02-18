import { Router } from 'express';
import { userController } from '@controllers/index';
import { authenticate } from '@config/middleware/authenticate';

const userRouter = Router();

// All user routes require a valid Bearer token
userRouter.use(authenticate);

// GET /api/v1/user/me - get current user profile
userRouter.get('/me', userController.getMeHandler);

export { userRouter };
