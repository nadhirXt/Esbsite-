const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'benelhadjbenelhadj@gmail.com', // Replacing with actual email from env later, wait I need to load env
    pass: 'your_pass'
  }
});
