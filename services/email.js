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
         html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">CTF TechOps Backend Task</a>
    </div>
    <p style="font-size:1.1em">Hello there,</p>
    <p> Please use the verification code below in order to continue.</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Velmurugan Jeyakumar</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>TechOps Domain</p>
      <p>CEG Tech Forum</p>
      <p>College of Engineering, Guindy</p>
    </div>
  </div>
</div>`,
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
