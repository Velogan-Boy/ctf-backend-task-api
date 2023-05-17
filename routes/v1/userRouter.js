const express = require('express');

const router = express.Router();

const { registerUser, verifyOTPHandler, regenerateOtpHandler, resetPasswordHandler, authenticate, logout, getUserHandler } = require('../../controllers/userControllers');

const tokenAuth = require('../../middlewares/tokenAuth');
const verifyCaptcha = require('../../middlewares/verifyCaptcha');
const { validateRegisterUser } = require('../../validations/userValidations');

router
   .get('/', tokenAuth, getUserHandler)
   .post('/register', validateRegisterUser, verifyCaptcha, registerUser)
   .post('/authenticate', verifyCaptcha, authenticate)
   .post('/verify', verifyOTPHandler)
   .post('/regenerateOTP', regenerateOtpHandler)
   .post('/resetPassword', resetPasswordHandler)
   .get('/logout', tokenAuth, logout);

module.exports = router;
