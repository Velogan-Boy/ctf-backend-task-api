const express = require('express');

const router = express.Router();

const { registerUser, verifyOTPHandler, regenerateOtpHandler, resetPasswordHandler, authenticate, logout } = require('../../controllers/userControllers');

const tokenAuth = require('../../middlewares/tokenAuth');

router
   .post('/register', registerUser)
   .post('/authenticate', authenticate)
   .post('/verify', verifyOTPHandler)
   .post('/regenerateOTP', regenerateOtpHandler)
   .post('/resetPassword', resetPasswordHandler)
   .get('/logout', tokenAuth, logout);

module.exports = router;
