const plivo = require("plivo");

const sendOTP = async (to, code) => {
	let client = new plivo.Client(env.pilvoId, env.pilvoAuthToken);
	client.messages
		.create({
			src: "<sender_id>",
			dst: to,
			text: "Hello, from Node Express!",
		})
		.then(function (message_created) {
			console.log(message_created);
		});
};

module.exports = sendOTP;
