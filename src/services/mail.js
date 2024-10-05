const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
	const transporter = nodemailer.createTransport(env.email);

	const mailOptions = {
		from: env.email.from,
		...options,
	};

	const info = await transporter.sendMail(mailOptions);

	return info.messageId;
};

module.exports = sendEmail;
