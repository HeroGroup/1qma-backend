exports.verificationHtml = (code) => {
	return `<div>
	<img src="https://api.staging.1qma.games/images/logo.png" alt="logo" title="logo" width="250"/>
	</div>
	<hr style="border:2px solid lightgray;" />
	<div style="text-align:center">
	<img src="${env.app.url}/images/verify.png" alt="verify" title="verify" width="200" />
	<h2>Verification Code</h2>
	</div>
	<p>Thank you for registering with <b>1QMA</b></p>
	<p>To complete the registration process, Please enter the following verification code:</p>
	<p>Verification code: <b>${code}</b></p>
	<p>If you did not make this request, please ignore this email or contact our support team.</p>
	<label>Best Regards,</label><br>
	<b>1QMA</b>`;
};
