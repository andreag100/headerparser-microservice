const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: 'mail@web-coffee.asia', // Your Zoho email address
        pass: 'RJAKJ96gtCn3' // Your Zoho email password or app-specific password
    }
});

function sendEmail(subject, message) {
    const mailOptions = {
        from: 'mail@web-coffee.asia', // Sender address
        to: 'webmaster@creareweb.com', // List of receivers
        subject: subject, // Subject line
        text: message // Plain text message body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = {
    sendEmail
};
