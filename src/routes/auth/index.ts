import { Router } from 'express';
import { authController } from '@controllers/index';

const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', authController.loginHandler);

// POST /api/v1/auth/register
authRouter.post('/register', authController.registerHandler);

export { authRouter };
