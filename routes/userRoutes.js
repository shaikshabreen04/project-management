import express from 'express';

import {

    signup,

    signin,

    createUser,

    getAllUsers,

    getUserById,

    updateUser,

    deleteUser,

    forgotPassword,

    resetPassword,

    forgotPasswordOtp,

    resetPasswordOtp

} from '../controllers/userController.js';


const router = express.Router();


// ==================== SIGN UP ====================

router.post('/signup', signup);


// ==================== SIGN IN ====================

router.post('/signin', signin);


// ==================== FORGOT PASSWORD - RESET LINK ====================

router.post('/forgot-password', forgotPassword);


// ==================== RESET PASSWORD - RESET LINK ====================

router.post('/reset-password', resetPassword);


// ==================== FORGOT PASSWORD - OTP ====================

router.post('/forgot-password-otp', forgotPasswordOtp);


// ==================== RESET PASSWORD - OTP ====================

router.post('/reset-password-otp', resetPasswordOtp);


// ==================== USER CRUD ====================

router.post('/', createUser);

router.get('/', getAllUsers);

router.get('/:id', getUserById);

router.put('/:id', updateUser);

router.delete('/:id', deleteUser);


export default router;