const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDefinition = {
	openapi: "3.0.0",
	info: {
		title: "1QMA API List",
		version: "1.0.0",
	},
};
const options = {
	swaggerDefinition,
	apis: ["./src/routes/admin/*.js", "./src/routes/client/*.js"],
};
exports.swaggerSpec = swaggerJSDoc(options);
