exports.forgotPasswordHtml = (code) => {
	return `<div>
	<img src="https://api.staging.1qma.games/images/logo.png" alt="logo" title="logo" width="250"/>
	</div>
	<hr style="border:2px solid lightgray;" />
	<div style="text-align:center">
	<img src="${env.app.url}/images/reset_pass.png" alt="reset password" title="reset password" width="200" />
	<h2>Reset Your Password</h2>
	</div>
	<p>We have received your request to reset your account password. Please use the below verification code to reset your password:</p>
	<b>${code}</b>
	<p>If you did not make this request, please ignore this email.</p>
	<label>Thank you,</label><br>
	<b>1QMA</b>`;
};

exports.forgotPasswordHtmlFa = (code) => {
	return `<div>
	<img src="https://api.staging.1qma.games/images/logo.png" alt="logo" title="logo" width="250"/>
	</div>
	<hr style="border:2px solid lightgray;" />
	<div style="text-align:center">
	<img src="${env.app.url}/images/reset_pass.png" alt="reset password" title="reset password" width="200" />
	<h2>Reset Your Password</h2>
	</div>
	<p>We have received your request to reset your account password. Please use the below verification code to reset your password:</p>
	<b>${code}</b>
	<p>If you did not make this request, please ignore this email.</p>
	<label>Thank you,</label><br>
	<b>1QMA</b>`;
};
