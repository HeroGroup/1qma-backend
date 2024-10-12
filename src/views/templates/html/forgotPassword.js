exports.forgotPasswordHtml = (code) => {
	return `<h1>Reset Your Password</h1>
	<p>We have received your request to reset your account password. Please use the below verification code to reset your password:</p>
	<b>${code}</b>
	<p>If you did not make this request, please ignore this email.</p>
	<p>Thank you,</p>
	<b>1QMA</b>`;
};
