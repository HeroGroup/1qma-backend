exports.inviteGameHtml = (link, invitee) => {
	return `<h1>Invitation to Play</h1>
	<p>I've found an exciting online game, and i thought it would be fun if we played together. All you need to do is to click on the link below and join me:</p>
	<a href="${link}">${link}</a>
	<p>Looking forward to playing with you!</p>
	<p>Best Regards,</p>
	<b>${invitee}</b>`;
};
