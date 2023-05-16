const prisma = require('../prisma/prisma');
const otpGenerator = require('otp-generator');

const generateOTP = () => {
   return {
      otp: otpGenerator.generate(6, { upperCaseAlphabets: true, specialChars: false }),
      err: null,
   };
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
         return { verified: false, message: 'Please try again', err: 'OTP is expired', error_type: 2 };
      }

      if (otp != result[0].otp) {
         return { verified: false, message: "OTP doesn't match. Please try again.", err: null, error_type: 3 };
      }

      let verifyErr = await markEmailAsVerified(email);
      if (verifyErr) {
         return { verified: false, message: 'Internal Server Error', err: verifyErr, error_type: 1 };
      }

      return { verified: true, message: 'Email verification Successful', err: null, error_type: 0 };
   } catch (err) {
      return { verified: false, message: 'Internal Server Error', err, error_type: 1 };
   }
};

module.exports = {
   generateOTP,
   insertOTPInDB,
   verifyOTP,
};
