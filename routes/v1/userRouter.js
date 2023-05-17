const express = require('express');

const router = express.Router();

const { registerUser, verifyOTPHandler, regenerateOtpHandler, resetPasswordHandler, authenticate, logout, getUserHandler } = require('../../controllers/userControllers');

const tokenAuth = require('../../middlewares/tokenAuth');

router
   .get('/', tokenAuth, getUserHandler)
   .post('/register', registerUser)
   .post('/authenticate', authenticate)
   .post('/verify', verifyOTPHandler)
   .post('/regenerateOTP', regenerateOtpHandler)
   .post('/resetPassword', resetPasswordHandler)
   .get('/logout', tokenAuth, logout);

module.exports = router;
