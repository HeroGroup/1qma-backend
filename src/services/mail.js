const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
	const transporter = nodemailer.createTransport(env.email);

	const mailOptions = {
		from: env.emailFrom,
		to,
		subject,
		html,
	};

	const info = await transporter.sendMail(mailOptions);

	return info.messageId;
};

module.exports = sendEmail;
