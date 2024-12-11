exports.supportHtml = (senderEmail, senderName, message) => {
	return `<div>
		<label>Sender Email:</label>
		<b>${senderEmail}</b>
	</div>
	<div>
		<label>Sender Name:</label>
		<b>${senderName}</b>
	</div>
	<div>
		<label>Message:</label>
		<b>${message}</b>
	</div>`;
};
