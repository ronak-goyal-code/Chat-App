import express from 'express';
import { registerUser, loginUser, logout, getProfile, getOtherUsers } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/get-profile', isAuthenticated ,getProfile);
router.get('/get-other-users', isAuthenticated ,getOtherUsers);


export default router;