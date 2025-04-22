const nodemailer = require('nodemailer');

let instance;

class Mailer {
  #queue;

  #processing;

  #transporter;

  constructor() {
    this.#queue = [];
    this.#processing = false;
    this.#transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  }

  #send(mailOptions) {
    this.#transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Failed to send Email');
        console.log(error);
      }
      else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  }

  async #processQueue() {
    this.#processing = true;

    while (this.#queue.length > 0) {
      const mailOptions = this.#queue.shift();

      try {
        this.#send(mailOptions);
      }
      catch (error) {
        console.error('Error sending email:', error);
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    this.#processing = false;
  }

  #queueEmail(mailOptions) {
    this.#queue.push(mailOptions);
    if (!this.#processing) {
      this.#processQueue();
    }
  }

  #constructMailOptions({ subject, text, html, cc }) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: 'recipient@example.com',
      subject,
      text,
      html,
      cc
    };

    return mailOptions;
  }


  sendLowStockNotification({ name, inStock, measurementUnit, shopLink }) {
    const optionsCorpus = this.#constructMailOptions({
      subject: `Stock of "${name}" is running low`,
      html: `<p>"${name}" only has ${inStock} ${measurementUnit} left</p>
      ${shopLink && `<br /><a href=${shopLink} target="_blank" rel='noopener noreferrer'>Restock</a>`}`
    });

    this.#queueEmail(optionsCorpus);
  };
}

module.exports = (() => {
  if (!instance) instance = new Mailer();
  return instance;
})();
