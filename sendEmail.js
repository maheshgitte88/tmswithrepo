const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other email services
  auth: {
    user: process.env.EMAIL_USER, // Your email from environment variable
    pass: process.env.EMAIL_PASS, // Your email password from environment variable
  },
});

// Function to send an email
const sendEmail = async (to, subject, cc, html ) => {
  try {
    const info = await transporter.sendMail({
      from: `"TMS-MITSDE" <${process.env.EMAIL_USER}>`, // Sender address
      to: to, // List of receivers
      subject: subject, // Subject line
      cc: cc,
      // text: text, // Plain text body
      html: html, // HTML body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email: %s', error);
  }
};

// Example usage
// sendEmail(
//   'maheshgitte88@gmail.com',
//   'Test Subject',
//   'Hello, this is a test email!',
//   '<b>Hello, this is a test email!</b>'
// );

module.exports = sendEmail;
