const UserOTP = require('../models/UserOTP');

const nodemailer = require('nodemailer');

const sendOTP = (email, otp) => {
   try {
      const Transport = nodemailer.createTransport({
         service: 'Gmail',
         auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
         },
         tls: {
            rejectUnauthorized: false,
         },
      });

      const mailOptions = {
         from: 'CTF - Velmurugan J',
         to: email,
         subject: 'OTP verification for the app made by Velmurugan Jeyakumar',
         html: `<p>Hello, <br/> Please use the verification code below in order to complete registration process.<br/></p>
                    <center>
                        <p style="font-size: 20px; color: blue;">
                            <b>${otp}</b>
                        </p>
                    </center>
                    <br/> <p>Validity of this code is <b>5 minutes</b>.</p><br/><br/>
                    <p>Thanks,<br/> - Velogan_boy</p>`,
      };
      Transport.sendMail(mailOptions, (err) => {
         if (err) {
            throw err;
         }
      });
   } catch (err) {
      console.log(err);
      return err;
   }

   return null;
};

const sendOTPToUser = async (email, userID) => {
   // generate otp
   let { otp, err } = UserOTP.generateOTP();

   // insert otp
   let error = await UserOTP.insertOTPInDB({ email, userID, otp });
   if (error) {
      return error;
   }

   // send email
   error = sendOTP(email, otp);
   if (error) {
      return error;
   }

   return null;
};

module.exports = {
   sendOTP,
   sendOTPToUser,
};
