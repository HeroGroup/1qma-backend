exports.indexRoutes = (app) => {
	app.get("/", (req, res) => {
		res.send("Hello From 1QMA DEV Team!");
	});
};
