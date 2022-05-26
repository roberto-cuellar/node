// Send an email using nodemailer
require('dotenv').config();
const nodemailer = require('nodemailer');

emailFrom = process.env.USER_FROM;
emailTo = process.env.USER_TO;

const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: emailFrom,
        pass: process.env.USER_KEY
    }
})

const mailOptions  = {
    from: emailFrom,
    to: emailTo,
    subject: 'Sending Email using Node.js 112',
    text: 'That was easy'
}

transporter.sendMail(mailOptions,(error,info)=>{
    error?(console.log(error)):(console.log('Email sent: '+info.response))
})
