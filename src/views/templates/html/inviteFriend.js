exports.inviteFriendHtml = (link, invitee) => {
	return `<h1>Invitation to the Platform</h1>
	<p>I've recently started using a new system that has been incredibly helpful and an amazing experience for me. I would love for you to join and take advantage of all the great feature it offers.</p>
	<p>If you're interested in learing more or signing up, you can use this link:</p>
	<a href="${link}">${link}</a>
	<p>Looking forward to playing with you!</p>
	<p>Best Regards,</p>
	<b>${invitee}</b>`;
};
