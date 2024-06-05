const bcrypt = require("bcrypt");
const User = require("../models/User");
const { validateEmail } = require("../validator");

exports.login = async (params) => {
	try {
		// check email is valid
		if (!validateEmail(params.email)) {
			return fail("invalid email address!", params);
		}

		if (!params.password) {
			return fail("Enter password!", params);
		}

		const user = await User.findOne({ email: params.email, userType: "admin" });
		if (!user || !bcrypt.compareSync(params.password, user.password)) {
			return fail("Invalid email and password combination!", params);
		}

		delete user["password"];
		// delete user["__v"];

		// TODO: send some bearer token as well

		return success("successfull login!", user);
	} catch (e) {
		return handleException(e);
	}
};
