const axios = require("axios");
const crypto = require("crypto");
const https = require("https");
const utf8 = require("utf8");

exports.sendOTP = (to) => {
	const hash = crypto.createHash("md5");
	const application = {
		key: env.sinchAppKey,
		secret: env.sinchAppSecret,
		endpoint: to,
	};
	let result = false;

	const bodyData = JSON.stringify({
		identity: {
			type: "number",
			endpoint: application.endpoint,
		},
		method: "sms",
	});

	let hmac = crypto.createHmac(
		"sha256",
		Buffer.from(application.secret, "base64")
	);
	let contentMD5 = hash.update(utf8.encode(bodyData)).digest("base64");
	let contentLength = Buffer.byteLength(bodyData);
	let timeStampISO = new Date().toISOString();

	let stringToSign =
		"POST" +
		"\n" +
		contentMD5 +
		"\n" +
		"application/json; charset=UTF-8" +
		"\n" +
		"x-timestamp:" +
		timeStampISO +
		"\n" +
		"/verification/v1/verifications";

	hmac.update(stringToSign);
	let signature = hmac.digest("base64");

	const options = {
		method: "POST",
		hostname: "verificationapi-v1.sinch.com",
		port: 443,
		path: "/verification/v1/verifications",
		headers: {
			"content-Type": "application/json; charset=UTF-8",
			"x-timestamp": timeStampISO,
			"content-length": contentLength,
			authorization: String("application " + application.key + ":" + signature),
		},
		data: bodyData,
	};

	const req = https.request(options, (res) => {
		res.setEncoding("utf8");
		res.on("data", (chunk) => {
			// console.log(`:: body response: => ${chunk}`);
			result = true;
		});
	});

	req.on("error", (e) => {
		// console.error(`problem with request: ${e.message}`);
	});

	req.write(bodyData);
	req.end();

	return result;
};

exports.verifyOTP = async (number, code) => {
	const SINCH_URL =
		"https://verification.api.sinch.com/verification/v1/verifications/number/" +
		number;

	const basicAuthentication = env.sinchAppKey + ":" + env.sinchAppSecret;

	const payload = {
		method: "sms",
		sms: {
			code,
		},
	};

	const headers = {
		Authorization:
			"Basic " + Buffer.from(basicAuthentication).toString("base64"),
		"Content-Type": "application/json; charset=utf-8",
	};

	await axios
		.put(SINCH_URL, payload, { headers })
		.then((response) => {
			return response.data.status === "SUCCESSFUL";
		})
		.catch((error) => {
			console.error("There was an error!", error);
			return false;
		});
};
