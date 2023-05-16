const express = require('express');

const router = express.Router();

const {
   registerUser,
   verifyOTPHandler,
   regenerateOtpHandler,
   forgotPasswordHandler,
   verifyOTPForPasswordResetHandler,
   resetPasswordHandler,
   authenticate,
   logout,
} = require('../../controllers/userControllers');

const tokenAuth = require('../../middlewares/tokenAuth');

router
   .post('/register', registerUser)
   .post('/authenticate', authenticate)
   .post('/verify', tokenAuth, verifyOTPHandler)
   .post('/regenerateOTP', tokenAuth, regenerateOtpHandler)
   .post('/forgotPassword', forgotPasswordHandler)
   .post('/verifyOTPForPasswordReset', verifyOTPForPasswordResetHandler)
   .post('/resetPassword', tokenAuth, resetPasswordHandler)
   .get('/logout', tokenAuth, logout);

module.exports = router;
