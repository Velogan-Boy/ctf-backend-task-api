const axios = require('axios');

const verifyCaptcha = (req, res, next) => {
   const { recaptchaToken } = req.body;

   if (!recaptchaToken) {
      return res.status(400).json({ message: 'Missing recaptcha token' });
   }

   const secretKey = process.env.RECAPTCHA_SECRET_KEY;

   axios
      .post(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`)
      .then((response) => {
         if (response.data.success) {
            next();
         } else {
            return res.status(400).json({ message: 'Invalid recaptcha token' });
         }
      })
      .catch((err) => {
         return res.status(500).json({ message: 'Internal Server Error', error: err.message });
      });
};

module.exports = verifyCaptcha;
