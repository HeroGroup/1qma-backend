const { getUsers, addUser } = require("../controllers/UserController");

exports.usersRoutes = (app) => {
	app.get("/users", async (req, res) => {
		res.json(await getUsers());
	});

	app.post("/users", async (req, res) => {
		const { firstName, lastName, email, password } = req.body;
		const newUserResult = await addUser({
			firstName,
			lastName,
			email,
			password,
		});
		res.json({ status: 1, message: newUserResult });
	});
};
