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

  async sendOTPNewUser(otp, user) {
    await this.send(
      "[homeNet] Welcome to homeNet",
      `Hi ${user.name}. \nWelcome to homeNet, we hope you have a good time in here.\nPlease verify your account by this OTP: ${otp}, this OTP will be expired after 15 minutes`
    );
  }
  async reSendOtpNewUser(otp, user) {
    await this.send(
      "[homeNet] Resending verification for new user",
      `Hi ${user.name}. \nWe have received your resend otp request from email: ${user.email} \n Please feel free to use this OTP: ${otp}, this OTP will be expired after 15 minutes`
    );
  }
  async sendOTPResetPassword(otp, user) {
    await this.send(
      "[homeNet] Renew password request",
      `Hi ${user.name}.\nWe have received your renew password request from email: ${user.email}. \nFeel free confirm your request by using this OTP: ${otp}, please remember that this OTP is only valid in 15 minutes`
    );

  }
};