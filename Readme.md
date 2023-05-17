# CEG Tech Forum - Techops Student Director Recruitment 2023-24

## Task #1 - Backend Development

Get your hands dirty (try not to use any wrapper modules like passport) and create a web application
with simple sign-up, sign-in functionality.

-  Sign-up must have email confirmation feature
-  Forgot password feature using email as recovery
-  Two factor authentication (do not use SMS)
   -- Think of and create a simple authenticator.
   -- Example: Via WhatsApp / Telegram / Google’s 2FA. (Anything other than SMS)
-  Race conditions are to be avoided, i.e. only one user can login at a time, and only one
   session must be active.

-  Provide documentation for all the API routes with all necessary details.
-  Push your code and documentation (or doc links) to GitHub/GitLab.

## Tech Stack Used

-  Node.js
-  Express.js
-  PostgreSQL
-  Prisma
-  Nodemailer
-  JWT
-  Google reCAPTCHA
-  Joi

## Router Configuration

-  **GET `/`** - This route is used to check if the user is logged in or not. If the user is logged in, the user's information is returned. If the user is not logged in, an error is returned.

   -  Middleware: `tokenAuth`
   -  Handler: `getUserHandler`
   -  Headers: `tokenstring`
   -  Body: `none`

<br/>

-  **POST `/register`** - This route is used to register a new user.

   -  Middleware: `validateRegisterUser`, `verifyCaptcha`
   -  Handler: `registerUser`
   -  Body: `email`, `password`, `captchaToken`

<br/>

-  **POST `/authenticate`** - This route is used to initiate the authentication process. This route sends an OTP (One-Time Password) to the user's email address.

   -  Middleware: `verifyCaptcha`
   -  Handler: `authenticate`
   -  Body: `email`, `password`, `captchaToken`

<br/>

-  **POST `/verify`** - This is second step of two-factor authentication. This route is used to verify the OTP (One-Time Password) sent to the user.

   -  Handler: `verifyOTPHandler`
   -  Body: `otp`, `email`, `userid`

<br/>

-  **POST `/regenerateOTP`** - This route is used to regenerate the OTP (One-Time Password) sent to the user.

   -  Handler: `regenerateOtpHandler`
   -  Body: `email`

<br/>

-  **POST `/resetPassword`** - This route is used to reset the user's password.

   -  Handler: `resetPasswordHandler`
   -  Body: `email`, `password`, `otp`

<br/>

-  **GET `/logout`** - This route is used to log out the user.
   -  Middleware: `tokenAuth`
   -  Handler: `logout`
   -  Headers: `tokenstring`
   -  Body: `none`

<br/>
