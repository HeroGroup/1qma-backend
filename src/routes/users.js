const { getUsers, addSampleUser } = require("../controllers/UserController");

exports.usersRoutes = (app) => {
	app.get("/users", async (req, res) => {
		res.json(await getUsers());
	});

	app.get("/users/add/sample", async (req, res) => {
		res.json(await addSampleUser());
	});
};
