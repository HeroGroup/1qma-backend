const { getUsers, addSampleUser } = require("../controllers/UserController");

exports.usersRoutes = (app) => {
	app.get("/users", async (req, res) => {
		res.json(await getUsers());
	});
};
