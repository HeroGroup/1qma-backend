exports.inviteGameHtml = (link, invitee) => {
	return `<div>
	<img src="https://api.staging.1qma.games/images/logo.png" alt="logo" title="logo" width="250"/>
	</div>
	<hr style="border:2px solid lightgray;" />
	<div style="text-align:center">
	<img src="${env.app.url}/images/invite.png" alt="invitation to game" title="invitation to game" width="200" />
	<h2>Invitation to Play</h2>
	</div>
	<p>I've found an exciting online game, and i thought it would be fun if we played together. All you need to do is to click on the link below and join me:</p>
	<a href="${link}">${link}</a>
	<p>Looking forward to playing with you!</p>
	<label>Best Regards,</label><br>
	<b>${invitee}</b>`;
};
