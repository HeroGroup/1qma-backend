const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
	const transporter = nodemailer.createTransport(env.email);

	const mailOptions = {
		from: env.emailFrom,
		...options,
	};

	const info = await transporter.sendMail(mailOptions);

	return info.messageId;
};

module.exports = sendEmail;
