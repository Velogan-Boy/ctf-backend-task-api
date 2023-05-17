const User = require('../models/User');
const UserOTP = require('../models/UserOTP');
const Session = require('../models/Session');

const services = require('../services/email');
const { createJWT } = require('../services/jwtAuth');
const { hashPassword, verifyPassword } = require('../utils/hashPassword');

const getUserHandler = async (req, res) => {
   const { user, err } = await Session.getUserBySession(req.headers['tokenstring']);

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
   }

   if (!user) {
      return res.status(400).json({ message: 'Invalid Session' });
   }

   return res.status(200).json({ message: 'User found', user });
};

// Authentication 1st Step -> returns user_id
const authenticate = async (req, res) => {
   let { email, password } = req.body;

   // missing input from frontend
   if (!email || !password) {
      return res.status(400).json({ message: 'Missing Credentials' });
   }

   // get user from db
   let { user, err } = await User.getUser(email);

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
   }

   // user unregistered
   if (user.id == 0) {
      return res.status(400).json({ message: 'User not registered' });
   }

   // password check
   let isMatch = verifyPassword(password, user.password);

   if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
   }

   // For 2FA - 2nd Step is to verify OTP
   let otpError = await services.sendOTPToUser(email, user.id);

   if (otpError) {
      return res.status(500).json({ message: 'Internal Server Error', error: otpError.message });
   }

   return res.status(200).json({
      message: 'OTP sent successfully to your email',
      user_id: user.id,
      isEmailVerified: user.is_email_verified,
   });
};

const verifyOTPHandler = async (req, res) => {
   let { email, otp, userid } = req.body;

   if (!email || !otp) {
      return res.status(400).json({ message: 'Missing Credentials' });
   }

   if (!userid) {
      return res.status(400).json({ message: 'Missing User ID' });
   }

   let { verified, message, err: otperr } = await UserOTP.verifyOTP(email, otp);

   if (otperr || !verified) {
      return res.status(400).json({
         message,
         error: otperr,
      });
   }

   // create jwt token
   let token = createJWT(email);

   // create session
   let sessionErr = await Session.createNewSession(userid, token);

   if (sessionErr) {
      return res.status(500).json({ message: 'Internal Server Error', error: sessionErr.message });
   }

   return res.status(200).json({ message, token });
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

   return res.status(201).json({ message: 'Registration Successful', user_id: userID, isEmailVerified: false });
};

const regenerateOtpHandler = async (req, res) => {
   let { email } = req.body;

   if (!email) {
      return res.status(400).json({ message: 'Missing Email' });
   }

   let { user, err } = await User.getUser(email);

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
   }

   // user unregistered
   if (user.id == 0) {
      return res.status(400).json({ message: 'User not registered' });
   }

   // otp to user
   let otpError = await services.sendOTPToUser(email, user.id);

   if (otpError) {
      return res.status(500).json({ message: 'Internal Server Error', error: otpError.message });
   }

   return res.status(200).json({ message: 'OTP sent successfully', user_id: user.id });
};

const resetPasswordHandler = async (req, res) => {
   let { otp, email, password } = req.body;

   if (!otp) {
      return res.status(400).json({ message: 'Missing OTP' });
   }

   if (!password) {
      return res.status(400).json({ message: 'Missing Password' });
   }

   if (!email) {
      return res.status(400).json({ message: 'Missing Credentials' });
   }

   let { verified, message, err: otperr } = await UserOTP.verifyOTP(email, otp);

   if (otperr || !verified) {
      return res.status(400).json({
         message,
         error: otperr,
      });
   }

   password = hashPassword(password);

   const { user, err: userErr } = await User.getUser(email);

   if (userErr) {
      return res.status(500).json({ message: 'Internal Server Error', error: userErr.message });
   }

   let { err: updateErr } = await User.updatePassword(user.id, password);

   if (updateErr) {
      return res.status(500).json({ message: 'Internal Server Error', error: updateErr.message, error_type: 1 });
   }

   return res.status(200).json({ message: 'Password updated successfully' });
};

const logout = async (req, res) => {
   let token = req.headers['tokenstring'];

   if (!token) {
      return res.status(400).json({ message: 'Missing Token' });
   }

   let err = await Session.expireSession(token);

   if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
   }

   return res.status(200).json({ message: 'Logout Successful' });
};

module.exports = {
   getUserHandler,
   registerUser,
   verifyOTPHandler,
   regenerateOtpHandler,
   resetPasswordHandler,
   authenticate,
   logout,
};
