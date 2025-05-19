import express from "express";
import { register, login, logout, forgotPassword, resetPassword } from "../controller/authcontroller.js";
import { authenticate } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

// Auth routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

// Test route for authentication
authRouter.get('/me', authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            userType: req.user.userType
        }
    });
});

export default authRouter;