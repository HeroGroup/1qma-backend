const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const { indexRoutes } = require("./src/routes/index");
const { usersRoutes } = require("./src/routes/users");

mongoose
	.connect("mongodb://127.0.0.1:27017/1qma")
	.catch((err) => console.log(err));

app.use(express.json());

indexRoutes(app);
usersRoutes(app);

app.listen(port, () => {
	console.log(`1QMA app is listening on port ${port}`);
});
