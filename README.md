# Overview
Image Drive is a full-stack web application that allows you to upload and store images along with their titles and descriptions in the cloud. App is PWA enabled and can be installed on Desktop, Android and IOS for convenience. Features a rich Tech Stack as well as security measures to prevent cyber attacks and bots.
# Live Demo
Live demo is available [here](https://imagedrive.jgolebiewski.com).
# Getting Started
To run the project locally or in a production setting:
1. Make sure you have node.js and npm installed

2. Clone the repository  
`git clone https://github.com/Jed-g/image-drive.git`
3. Navigate to the newly created folder in the console and run  
`npm i`  
to install the project dependencies
4. Create your reCAPTCHA v3 secret and public keys [here](https://www.google.com/recaptcha/admin/create). Make sure to add 'localhost' and production URL e.g. 'imagedrive.jgolebiewski.com' to the domains
5. Set your environment variables in the **.env** file
>MONGO_URL=\<MongoDB Connection URI, can be obtained from MongoDB Atlas or another database provider>  
>NEXTAUTH_URL=\<Full Deployment URL e.g. https://imagedrive.jgolebiewski.com or http://localhost:3000 for developing>  
>AUTH_SECRET=\<Random character seed For Encrypting JWT Tokens, the longer the better>  
>TOKEN_DURATION=\<Time Until Auto Logout In Seconds, recommended time is 7 days i.e., 604800 seconds>  
>SECRET_RECAPTCHA_KEY=\<Secret reCAPTCHA v3 Key>  
6. Set your public reCAPTCHA v3 key in **_app.js** on **line 44**
>\<GoogleReCaptchaProvider  reCaptchaKey="\<Public reCAPTCHA v3 Key>">
7. Set your deployment URL for production in **index.js** on **line 5**
>: "\<Insert Full Deployment URL e.g. https://imagedrive.jgolebiewski.com>";
8. There is an option to connect Google Analytics to the application for meaningful web traffic data. To do so create a Google Analytics property. Then create a web data stream and copy the **measurement id** to **gtag.js** on **line 1**
>export  const  GA_TRACKING_ID = "\<Insert Google Analytics Tracking Id>";
9. To run the application in a development environment, run  
`npm run dev`

10. To run the application in a production environment, run  
`npm start`  
This will build the project and run it
11. If you want the production deployment to have PWA enabled, make sure to serve the application through **https://** and not just **http://** as that is the requirement for PWAs
# Features
- Image storage with optional titles and descriptions. A limit of 16MB per image is in place to save storage space

- User authentication using NextAuth and encrypted JWTs with an expiry date. If a user logs out before JWT expiry date, the JWT is blacklisted

- Robust security system with secured api endpoints

- Suspicious activity and bot prevention with reCAPTCHA v3

- PWA is enabled which means that the app can be installed on Desktop, Android and IOS

- Image caching with SWR

- Dark/Light mode
