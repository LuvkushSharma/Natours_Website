const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const Transport = require('nodemailer-brevo-transport');


// -------------- Lec_8 ----------------

// It runs when a new object is created using this class.
module.exports = class Email {

    // 1) Passing user and that user contains email and for more personalized we also take name from it.

    // 2) Passing URL for e.g. the reset URL for resetting the password.
    constructor(user, url) {

      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.url = url;
      this.from = `Luvkush Sharma <${process.env.EMAIL_FROM}>`;

    }
    
    // ---------- Transporter ---------
    newTransport() {

        // In case of production we want to send the real email but in case of development env we want to trap the emil in mailtrap.io
        if (process.env.NODE_ENV === 'production') {

          // SendinBlue
          return nodemailer.createTransport({
            host: process.env.BREVO_HOST,
            port: process.env.BREVO_PORT,
            auth: {
              user: process.env.BREVO_USER,
              pass: process.env.BREVO_PASSWORD,
            },
        });
     }

      // else capture the mail in the mailtrap.io
      return nodemailer.createTransport({

        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {

             user:process.env.EMAIL_USERNAME,
             pass: process.env.EMAIL_PASSWORD
        }

       });

    }  
  
    async send (template , subject) {
        // Send the actual email

        // 1) Render the HTML based on a pug template
        // We donot want to render/create a HTML page but we donot really want to render all we want to do is to basically create the HTML out of the template so that we can then send that HTML as the email.

        // Also passing some placeholders as an option
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
          });

        // 2) Define the email options
        const mailOptions = {

            from: this.from,
    
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html)
    
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);

    }
    
    // It does nothing but just call the above send metjod with template and subject.
    async sendWelcome () {
        
        // Template name is 'welcome'
        await this.send ('welcome' , 'Welcome to the Adventure World Family!');    
    }

    // ---------------- Lec_10 --------------

    async sendPasswordReset() {
        
        // Template name is 'passwordReset'
        await this.send(
          'passwordReset',
          'Your password reset token (valid for only 10 minutes)'
        );
    }
}



