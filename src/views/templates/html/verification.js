exports.verificationHtml = (code) => {
	return `<h1>Verification Code</h1>
	<p>Thank you for registering with <b>1QMA</b></p>
	<p>To complete the registration process, Please enter the following verification code:</p>
	<p>Verification code: <b>${code}</b></p>
	<p>If you did not make this request, please ignore this email or contact our support team.</p>
	<p>Best Regards,</p>
	<b>1QMA</b>`;
};
