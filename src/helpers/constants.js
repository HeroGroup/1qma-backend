exports.authReasons = ["register", "login", "join_to_wait_list"];

exports.createModes = [
	{ id: "0", text: "I'm ready" },
	{ id: "1", text: "Topic by me" },
	{ id: "2", text: "Players by me" },
	{ id: "3", text: "I'm in Full Control" },
];

exports.gameTypes = [
	{ id: "normal", text: "Normal" },
	{ id: "survival", text: "Survival" },
];

exports.languages = [{ _id: "0", code: "en", title: "English" }];

exports.genders = [
	{ _id: "0", title: "Male" },
	{ _id: "1", title: "Female" },
	{ _id: "2", title: "prefer not to say" },
];

exports.educations = [
	{
		_id: "0",
		title: "Uneducated",
	},
	{
		_id: "1",
		title: "Bachelor Degree",
	},
	{
		_id: "2",
		title: "Masters Degree",
	},
	{
		_id: "3",
		title: "Phd",
	},
];

exports.homePages = [
	{
		id: "/dashboard",
		name: "Dashboard",
	},
	{
		id: "/games",
		name: "Games",
	},
];