const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.name = user.name;
    this.from = "HomeNet <homeNet.service@gmail.com>";
  }

  newTransporter() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
  }

  async send(subject, content) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: content,
    };

    await this.newTransporter().sendMail(mailOptions);
  }

  async sendOTP(otp) {
    await this.send(
      "Welcome to homeNet",
      `Welcome to our application, please verify your account by this OTP: ${otp}, this OTP will be expired after 15 minutes`
    );
  }
};
