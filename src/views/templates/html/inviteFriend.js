exports.inviteFriendHtml = (link, invitee) => {
	return `<div>
	<img src="https://api.staging.1qma.games/images/logo.png" alt="logo" title="logo" width="250"/>
	</div>
	<hr style="border:2px solid lightgray;" />
	<div style="text-align:center">
	<img src="${env.app.url}/images/platform.png" alt="invitation to platform" title="invitation to platform" width="200" />
	<h2>Invitation to the Platform</h2>
	</div>
	<p>I've recently started using a new system that has been incredibly helpful and an amazing experience for me. I would love for you to join and take advantage of all the great features it offers.</p>
	<p>If you're interested in learing more or signing up, you can use this link:</p>
	<a href="${link}">${link}</a>
	<p>Looking forward to playing with you!</p>
	<label>Best Regards,</label><br>
	<b>${invitee}</b>`;
};
