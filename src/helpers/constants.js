exports.sanitizeInputExceptions = [
	"password",
	"passwordConfirmation",
	"terms",
	"termsFa",
	"privacyPolicies",
	"privacyPoliciesFa",
];

exports.authReasons = ["register", "login", "join_to_wait_list"];

exports.createModes = [
	{ id: "0", text: "I'm ready" },
	{ id: "1", text: "Topic by me" },
	{ id: "2", text: "Players by me" },
	{ id: "3", text: "I'm in Full Control" },
];

exports.gameTypeNames = {
	NORMAL: "normal",
	SURVIVAL: "survival",
};

exports.gameTypes = [
	{ id: "normal", text: "Normal", textFa: "عادی" },
	{ id: "survival", text: "Survival", textFa: "بقا" },
];

exports.languages = [
	{ _id: "0", code: "en", title: "English" },
	{ _id: "2", code: "fa", title: "فارسی" },
];

exports.genders = [
	{ _id: "0", title: "Male", titleFa: "مرد" },
	{ _id: "1", title: "Female", titleFa: "زن" },
	{ _id: "2", title: "prefer not to say", titleFa: "ترجیح میدهم نگم" },
];

exports.educations = [
	{
		_id: "0",
		title: "Uneducated",
		titleFa: "بی سواد",
	},
	{
		_id: "1",
		title: "Bachelor Degree",
		titleFa: "لیسانس",
	},
	{
		_id: "2",
		title: "Masters Degree",
		titleFa: "فوق لیسانس",
	},
	{
		_id: "3",
		title: "Phd",
		titleFa: "دکتری",
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

exports.shopItemTypes = ["feature", "asset", "bundle"];

exports.settingsTypes = ["register", "game", "general", "tutorial_game"];

exports.gameStatuses = {
	CREATED: "created",
	STARTED: "started",
	ENDED: "ended",
	CANCELED: "canceled",
};

exports.notificationTypes = {
	NOTIFICATION: "notification",
	NOTIFICATION_MODAL: "notification:modal",
};

exports.notificationDataTypes = {
	GAME_INVITE: "GAME_INVITE",
};

exports.introTypes = ["dashboard", "games", "triviaHub", "shop"];

exports.emailTemplates = {
	VERIFICATION: "verification code",
	RESET_PASSWORD: "reset password",
	INVITE_FRIEND: "invitation",
	INVITE_GAME: "game invite",
};

exports.coinTypes = {
	BRONZE: "bronze",
	SILVER: "silver",
	GOLD: "gold",
};

exports.transactionTypes = {
	INCREASE: "increase",
	DECREASE: "decrease",
};

exports.currencies = { DOLLAR: "$" };

exports.registerQuestionTypes = {
	TEXT: "text",
	SELECT: "select",
	MULTIPLE_OPTIONS: "multiple_options",
	TOGGLE: "toggle",
};

exports.achievementConditions = {
	LEVEL: "level",
	XP: "xp",
	GAMES_WON: "games won",
	GAMES_CREATED: "games created",
	GAMES_PLAYED: "games played",
	REGISTERED_INVITEES: "invitees registered",
};

exports.achievementRewards = {
	BRONZE: "bronze",
	SILVER: "silver",
	GOLD: "gold",
	INVITATION: "invitation",
};
