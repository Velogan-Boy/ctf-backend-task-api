const User = require('./User');

const prisma = require('../prisma/prisma');

const generateOTP = () => {
   // 6 digit OTP
   return { otp: Math.floor(100000 + Math.random() * 900000), err: null };
};

const insertOTPInDB = async ({ email, userID, otp }) => {
   try {
      await prisma.$executeRaw`INSERT INTO user_otp (email,user_id,otp,expiry_time) \
        VALUES (${email}, ${userID}, ${otp}, now() + (5 * interval '1 minute')) ON CONFLICT (email) DO UPDATE SET otp = ${otp},expiry_time = now() + (5 * interval '1 minute')`;
   } catch (err) {
      return err;
   }

   return null;
};

const verifyOTP = async (userID, email, otp) => {
   try {
      const result = await prisma.$queryRaw`SELECT otp from user_otp WHERE email=${email} AND user_id=${userID} AND expiry_time > now()`;

      if (!result || result.length == 0) {
         return { verified: false, message: 'Please try again', err: 'OTP is expired' };
      }

      if (otp != result[0].otp) {
         return { verified: false, message: "OTP doesn't match. Please try again.", err: null };
      }

      // if email is not verified, mark it as verified
      let verifyErr = await User.markEmailAsVerified(email);

      if (verifyErr) {
         return { verified: false, message: 'Internal Server Error', err: verifyErr };
      }

      return { verified: true, message: 'Verification Successful', err: null };
   } catch (err) {
      return { verified: false, message: err };
   }
};

module.exports = {
   generateOTP,
   insertOTPInDB,
   verifyOTP,
};
