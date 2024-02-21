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

  async sendOTPNewUser(otp) {
    await this.send(
      "[homeNet]Welcome to homeNet",
      `Welcome to our application, please verify your account by this OTP: ${otp}, this OTP will be expired after 15 minutes`
    );
  }

  async sendOTPResetPassword(otp, user) {
    await this.send(
      "[homeNet] Renew password request",
      `Hi ${user.name}.\nWe have received your renew password request from email: ${user.email}. \nPlease confirm your request by using this OTP: ${otp}`
    )

  }
};
