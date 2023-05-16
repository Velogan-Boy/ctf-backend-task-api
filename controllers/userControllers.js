const User = require('../models/User');
const UserOTP = require('../models/UserOTP');
const Session = require('../models/Session');

const services = require('../services/email');
const { createJWT } = require('../services/jwtAuth');
const { hashPassword, verifyPassword } = require('../utils/hashPassword');

const authenticate = async (req, res) => {
   let { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ message: 'Missing Credentials', error_type: 3 });
   }

   let { user, err } = await User.getUser(email);

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message, error_type: 1 });
   }

   // user unregistered
   if (user.id == 0) {
      return res.status(400).json({ message: 'User not registered', error_type: 5 });
   }

   // password check
   let isMatch = verifyPassword(password, user.password);

   if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials', error_type: 3 });
   }

   // create new session
   const token = createJWT(email);

   let sessionErr = await Session.createNewSession(user.id, token);

   if (sessionErr) {
      return res.status(500).json({ message: 'Internal Server Error', error: sessionErr.message, error_type: 1 });
   }

   // user unverified
   if (!user.is_email_verified) {
      let { userID, err } = await Session.getUserIdByToken(token);
      if (err) {
         return res.status(500).json({
            message: 'Internal Server Error',
            error: err.message,
            error_type: 1,
         });
      }
      let otpError = await services.sendOTPToUser(email, userID);
      if (otpError) {
         return res.status(500).json({ message: 'Internal Server Error', error: otpError.message });
      }
      //Added if that person is not verified, he will get otp again
      return res.status(200).json({
         message: 'Email is not verified',
         error_type: 4,
         token: token,
      });
   }

   return res.status(200).json({
      message: 'Authentication Successful',
      error_type: 0,
      token: token,
   });
};

const registerUser = async (req, res) => {
   let { email, password } = req.body;

   // missing input from frontend
   if (!email || !password) {
      return res.status(400).json({ message: 'Missing User Information' });
   }

   const { user, err: error } = await User.getUser(email);

   if (error) {
      // error during db query
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
   }
   if (user.id != 0) {
      // already account exists with that email
      return res.status(400).json({ message: 'User already exists' });
   }

   // secure pass
   let pass = hashPassword(password);

   // create user account
   let { userID, err } = await User.createUser({ email, pass });

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
   } else if (!userID) {
      return res.status(500).json({ message: 'Something went wrong' });
   }

   // send otp to user
   let otpError = await services.sendOTPToUser(email, userID);
   if (otpError) {
      return res.status(500).json({ message: 'Internal Server Error', error: otpError.message });
   }

   // create new session
   const token = createJWT(email);

   let sessionErr = await Session.createNewSession(userID, token);

   if (sessionErr) {
      return res.status(500).json({ message: 'Internal Server Error', error: sessionErr.message });
   }

   return res.status(201).json({ message: 'Registration Successful', token: token });
};

const verifyOTPHandler = async (req, res) => {
   let token = req.headers['tokenstring'];

   if (!token) {
      return res.status(400).json({ message: 'Missing Token', error_type: 1 });
   }

   // verify whether the user has logged/signed in (active session)
   let { userID, err } = await Session.getUserIdByToken(token);

   if (err) {
      return res.status(500).json({
         message: 'Internal Server Error',
         error: err.message,
         error_type: 1,
      });
   }

   let { email, otp } = req.body;

   let { verified, message, err: otperr, error_type } = await UserOTP.verifyOTP(userID, email, otp);

   if (otperr || !verified) {
      return res.status(400).json({
         message,
         error: otperr,
         error_type,
      });
   }

   return res.status(200).json({ message, error_type });
};

const regenerateOtpHandler = async (req, res) => {
   let token = req.headers['tokenstring'];

   if (!token) {
      return res.status(400).json({ message: 'Missing Token', error_type: 1 });
   }

   // verify whether the user has logged/signed in (active session)
   let { userID, err } = await Session.getUserIdByToken(token);
   if (err) {
      return res.status(500).json({
         message: 'Internal Server Error',
         error: err.message,
         error_type: 1,
      });
   }

   let { email } = req.body;
   if (!email) {
      return res.status(400).json({
         message: 'Email is required',
         error: 'Missing Email',
         error_type: 2, // 1
      });
   }

   // otp to user
   let otpError = await services.SendOTPToUser(email, userID);
   if (otpError) {
      return res.status(500).json({ message: 'Internal Server Error', error: otpError.message, error_type: 1 });
   }

   return res.status(200).json({ message: 'OTP sent successfully', error_type: 0 });
};

const forgotPasswordHandler = async (req, res) => {
   let { email } = req.body;

   if (!email) {
      return res.status(400).json({ message: 'Missing Email', error_type: 1 });
   }

   let { user, err } = await User.getUser(email);

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message, error_type: 1 });
   }

   // user unregistered
   if (user.id == 0) {
      return res.status(400).json({ message: 'User not registered', error_type: 5 });
   }

   // otp to user
   let otpError = await services.SendOTPToUser(email, user.id);

   if (otpError) {
      return res.status(500).json({ message: 'Internal Server Error', error: otpError.message, error_type: 1 });
   }

   return res.status(200).json({ message: 'OTP sent successfully', error_type: 0 });
};

const verifyOTPForPasswordResetHandler = async (req, res) => {
   let { email, otp } = req.body;

   if (!email) {
      return res.status(400).json({ message: 'Missing Email', error_type: 1 });
   }

   if (!otp) {
      return res.status(400).json({ message: 'Missing OTP', error_type: 2 });
   }

   let { user, err } = await User.getUser(email);

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message, error_type: 1 });
   }

   // user unregistered
   if (user.id == 0) {
      return res.status(400).json({ message: 'User not registered', error_type: 5 });
   }

   let { verified, message, err: otperr, error_type } = await Email.VerifyOTP(user.id, email, otp);

   if (otperr || !verified) {
      return res.status(400).json({
         message,
         error: otperr,
         error_type,
      });
   }

   // create new session
   const token = createJWT(email);

   let sessionErr = await Session.createNewSession(user.id, token);

   if (sessionErr) {
      return res.status(500).json({ message: 'Internal Server Error', error: sessionErr.message, error_type: 1 });
   }

   return res.status(200).json({ message, token, error_type: 0 });
};

const resetPasswordHandler = async (req, res) => {
   let token = req.headers['tokenstring'];

   if (!token) {
      return res.status(400).json({ message: 'Missing Token', error_type: 1 });
   }

   // verify whether the user has logged/signed in (active session)
   let { userID, err } = await Session.getUserIdByToken(token);

   if (err) {
      return res.status(500).json({
         message: 'Internal Server Error',
         error: err.message,
         error_type: 1,
      });
   }

   let { password } = req.body;

   if (!password) {
      return res.status(400).json({ message: 'Missing Password', error_type: 1 });
   }

   password = hashPassword(password);

   let { err: updateErr } = await User.updatePassword(userID, password);

   if (updateErr) {
      return res.status(500).json({ message: 'Internal Server Error', error: updateErr.message, error_type: 1 });
   }

   return res.status(200).json({ message: 'Password updated successfully', error_type: 0 });
};

const logout = async (req, res) => {
   let token = req.headers['tokenstring'];

   if (!token) {
      return res.status(400).json({ message: 'Missing Token', error_type: 1 });
   }

   let err = await Session.expireSession(token);

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
   }

   res.removeHeader('tokenstring');

   return res.status(200).json({ message: 'Logout Successful' });
};

module.exports = {
   registerUser,
   verifyOTPHandler,
   regenerateOtpHandler,
   forgotPasswordHandler,
   verifyOTPForPasswordResetHandler,
   resetPasswordHandler,
   authenticate,
   logout,
};
