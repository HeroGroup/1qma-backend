const plivo = require("plivo");

const sendOTP = async (to, code) => {
	let client = new plivo.Client(env.plivoId, env.plivoAuthToken);
	client.messages
		.create({
			src: env.plivoSender,
			dst: to,
			text: `Verification from 1QMA\n#code: ${code}`,
		})
		.then(function (message_created) {
			console.log("sendOTP", message_created);
		});
};

module.exports = sendOTP;
