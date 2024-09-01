const {
	handleException,
	createHashedPasswordFromPlainText,
	checkSame,
	removeFile,
	objectId,
	renameFile,
} = require("../../helpers/utils");
const AccountType = require("../../models/AccountType");
const Category = require("../../models/Category");
const Game = require("../../models/Game");
const Question = require("../../models/Question");
const User = require("../../models/User");
const { validateEmail } = require("../../helpers/validator");

const {
	languages,
	genders,
	educations,
	homePages,
} = require("../../helpers/constants");
const { findMyFriends } = require("../../helpers/findMyFriends");
const Transaction = require("../../models/Transaction");
const moment = require("moment");

exports.init = async (userId) => {
	try {
		const accountTypes = await AccountType.find();
		const categories = await Category.find();
		const user = await User.findById(userId);

		return success("initialize parameters", {
			languages,
			genders,
			educations,
			accountTypes,
			categories,
			homePages,
			user,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.updateProfile = async (params) => {
	try {
		const { id, currentPassword, password, passwordConfirmation } = params;
		let { gender, education } = params;

		if (!id) {
			return fail("invalid user id!");
		}

		let user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		if (gender) {
			const updatedGender = genders.find((element) => element._id === gender);
			if (!updatedGender) {
				return fail("invalid gender was selected!", params);
			}
			gender = updatedGender;
		}

		if (education) {
			const updatedEducation = educations.find(
				(element) => element._id === education
			);

			if (!updatedEducation) {
				return fail("invalid education was selected", params);
			}
			education = updatedEducation;
		}

		const update = {
			firstName: params.firstName,
			lastName: params.lastName,
			gender,
			education,
			country: params.country,
			city: params.city,
			accountType: params.accountType,
		};

		console.log(currentPassword, password, passwordConfirmation, user.password);
		if (currentPassword && password && passwordConfirmation && user.password) {
			if (!checkSame(currentPassword, user.password)) {
				return fail("current password is incorrect!");
			}

			if (password !== passwordConfirmation) {
				return fail("password and password confirmation does not match!");
			}

			const newPassword = createHashedPasswordFromPlainText(password);

			update["password"] = newPassword;
		}

		user = await User.findOneAndUpdate(
			{ _id: id },
			{ ...update },
			{ new: true }
		);

		return success("User profile was updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateUserSettings = async (params) => {
	try {
		const { id, language } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!language) {
			return fail("invalid language was selected!");
		}

		const selectedLanguage = languages.find(
			(element) => element._id === language
		);

		const user = await User.findOneAndUpdate(
			{ _id: id },
			{
				preferedLanguage: selectedLanguage,
				defaultHomePage: params.defaultHomePage,
			},
			{
				new: true,
			}
		);

		return success("User settings was updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.updateProfilePicture = async (params, avatar) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid user id!");
		}
		if (!avatar) {
			return fail("invalid avatar!");
		}

		let user = User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		let avatarNewPath = `public/uploads/avatar-${id}.png`;
		renameFile(`${__basedir}/${avatar.path}`, `${__basedir}/${avatarNewPath}`);

		user = await User.findOneAndUpdate(
			{ _id: id },
			{ profilePicture: avatarNewPath.replace("public/", "") },
			{ new: true }
		);
		return success("profile picture updated successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.removeProfilePicture = async (params) => {
	try {
		const { id } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		let user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		if (user.profilePicture) {
			removeFile(`${__basedir}/public/${user.profilePicture}`);
		}

		user = await User.findOneAndUpdate(
			{ _id: id },
			{ profilePicture: "" },
			{ new: true }
		);

		return success("profile picture removed successfully!", user);
	} catch (e) {
		return handleException(e);
	}
};

exports.invite = async (params) => {
	try {
		const { id, email } = params;
		if (!id) {
			return fail("invalid user id");
		}
		if (!validateEmail(email)) {
			return fail("invalid email!");
		}

		// TODO: check limit

		// check if email is already exists
		const existingEmail = await User.countDocuments({
			email,
			emailVerified: true,
			$or: [{ inWaitList: false }, { inWaitList: { $exists: false } }],
		});
		if (existingEmail > 0) {
			return fail("This email address is already in!");
		}

		// add it to user invitations
		await User.findOneAndUpdate(
			{ _id: id },
			{
				$push: {
					invitations: { email, status: "pending", createdAt: moment() },
				},
			}
		);

		// TODO: create and send invite link
		return success(`Invitation Email was sent to ${email}`);
	} catch (e) {
		return handleException(e);
	}
};

exports.userDetails = async (id) => {
	try {
		if (!id) {
			return fail("invalid id!");
		}

		const user = await User.findById(id, {
			_id: 0,
			firstName: 1,
			lastName: 1,
			profilePicture: 1,
			statistics: 1,
			games: 1,
		});

		if (!user) {
			return fail("invalid user!");
		}

		const latestGames = await Game.find({
			"result.scoreboard._id": objectId(id),
			endedAt: { $exists: true },
		})
			.sort({ endedAt: -1 })
			.limit(5);

		const latestGamesMapped = latestGames.map((item) => {
			const userRankIndex = item.result?.scoreboard?.findIndex((elm) => {
				return elm._id.toString() === id;
			});
			return {
				_id: item._id,
				category: item.category,
				creator: item.item,
				players: item.players,
				gameType: item.gameType,
				endedAt: item.endedAt,
				rank: userRankIndex + 1,
				score: item.result?.scoreboard[userRankIndex]?.totalScore || 0,
			};
		});
		return success("User retrieved successfully!", {
			user,
			latestGames: latestGamesMapped,
		});
	} catch (e) {
		return handleException(e);
	}
};

exports.listQuestions = async (userId, params) => {
	try {
		const { category, type, search } = params;
		const page = params.page || 1;
		const limit = params.limit || 5;

		// if (!category) {
		// 	return fail("invalid category!");
		// }

		if (!type) {
			return fail(
				"invalid type! Type should be public, private, or bookmarked."
			);
		}

		let typeQuery = { showNothing: true };
		if (type === "public") {
			typeQuery = { user: { $exists: false } };
		} else if (type === "trivia") {
			// show all public and private questions
			typeQuery = {};
		} else if (type === "private") {
			typeQuery = { "user._id": objectId(userId) };
		} else if (type === "bookmark") {
			typeQuery = { bookmarks: objectId(userId) };
		}

		const query = {
			...(category ? { "category._id": objectId(category) } : {}),
			...typeQuery,
			...(search ? { question: { $regex: search, $options: "i" } } : {}),
		};

		const total = await Question.countDocuments(query);

		const questions = await Question.find(query)
			.skip((page - 1) * limit)
			.limit(limit);

		const res = questions.map((question) => {
			const liked = question.likes.includes(objectId(userId));
			const disliked = question.dislikes.includes(objectId(userId));
			const bookmarked = question.bookmarks.includes(objectId(userId));

			return {
				_id: question._id,
				category: question.category,
				question: question.question,
				answer: question.answer,
				user: question.user,
				likes: question.likes.length,
				dislikes: question.dislikes.length,
				liked,
				disliked,
				bookmarked,
				score: question.score,
				plays: question.plays,
				answers: question.answers,
				rates: question.rates,
				avgRate: question.avgRate,
				createdAt: question.createdAt,
			};
		});

		return success("ok", { total, questions: res });
	} catch (e) {
		return handleException(e);
	}
};

exports.addQuestion = async (params, language) => {
	try {
		const { id, category, question, answer } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!category) {
			return fail("invalid category!");
		}

		if (!question) {
			return fail("invalid question!");
		}

		const user = await User.findById(id, {
			_id: 1,
			firstName: 1,
			lastName: 1,
			email: 1,
			profilePicture: 1,
		});
		if (!user) {
			return fail("invalid user!");
		}

		const dbCategory = await Category.findById(category, {
			_id: 1,
			name: 1,
			icon: 1,
		});
		if (!dbCategory) {
			return fail("invalid category!");
		}

		const newQuestion = new Question({
			language,
			question,
			answer,
			category,
			user,
			score: 0,
			plays: 0,
			answers: 0,
			rates: 0,
			avgRate: 0,
			createdAt: moment(),
		});
		await newQuestion.save();

		return success(
			"Question was successfully added to your library!",
			newQuestion
		);
	} catch (e) {
		return handleException(e);
	}
};

exports.bookmarkQuestion = async (params) => {
	try {
		const { id, questionId } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!questionId) {
			return fail("invalid question id!");
		}

		const user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		const question = await Question.findById(questionId);
		if (!question) {
			return fail("invalid question!");
		}

		if (!question.bookmarks.includes(objectId(id))) {
			await Question.findOneAndUpdate(
				{ _id: objectId(questionId) },
				{
					$push: {
						bookmarks: objectId(id),
					},
				}
			);

			return success("Question bookmarked successfully!");
		}

		return fail("Question already bookmarked!");
	} catch (e) {
		return handleException(e);
	}
};

exports.removeBookmarkQuestion = async (params) => {
	try {
		const { id, questionId } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!questionId) {
			return fail("invalid question id!");
		}

		const user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		// const question = await Question.findById(questionId);
		// if (!question) {
		// 	return fail("invalid question!");
		// }

		await Question.findOneAndUpdate(
			{ _id: objectId(questionId) },
			{
				$pull: {
					bookmarks: objectId(id),
				},
			}
		);

		return success("Question bookmark removed successfully!");
	} catch (e) {
		return handleException(e);
	}
};

exports.likeQuestion = async (params) => {
	try {
		const { id, questionId, status } = params;
		if (!id) {
			return fail("invalid user id!");
		}

		if (!questionId) {
			return fail("invalid question id!");
		}

		if (!status) {
			return fail("invalid status!");
		}

		const user = await User.findById(id);
		if (!user) {
			return fail("invalid user!");
		}

		const question = await Question.findById(questionId);
		if (!question) {
			return fail("invalid question!");
		}

		const liked = question.likes.includes(objectId(id));
		const disliked = question.dislikes.includes(objectId(id));

		if (status === 1) {
			if (liked) {
				// already liked
				removeLike(questionId, id);
			} else if (disliked) {
				// already disliked
				removeDislike(questionId, id);
				like(questionId, id);
			} else {
				// neither liked, nor disliked yet
				like(questionId, id);
			}
		} else {
			// status === -1
			if (liked) {
				// already liked
				removeLike(questionId, id);
				dislike(questionId, id);
			} else if (disliked) {
				// already disliked
				removeDislike(questionId, id);
			} else {
				// neither liked, nor disliked yet
				dislike(questionId, id);
			}
		}

		return success("Success!");
	} catch (e) {
		return handleException(e);
	}
};

exports.topQuestions = async (userId, params) => {
	try {
		const { category, type } = params;
		const page = params.page || 1;
		const limit = params.limit || 5;

		if (!type) {
			return fail("invalid type! Type should be public or private.");
		}

		const questions = await Question.find({
			...(category ? { "category._id": objectId(category) } : {}),
			...(type === "private" ? { "user._id": objectId(userId) } : {}),
		})
			.sort({ score: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		const res = questions.map((question) => {
			const liked = question.likes.includes(objectId(userId));
			const disliked = question.dislikes.includes(objectId(userId));

			return {
				_id: question._id,
				category: question.category,
				language: question.language || env.defaultLanguage,
				question: question.question,
				answer: question.answer,
				user: question.user,
				likes: question.likes.length,
				dislikes: question.dislikes.length,
				liked,
				disliked,
				score: question.score,
				plays: question.plays,
				answers: question.answers,
				rates: question.rates,
				avgRate: question.avgRate,
				createdAt: question.createdAt,
			};
		});

		return success("ok", res);
	} catch (e) {
		return handleException(e);
	}
};

exports.questionPerformance = async (questionId, params) => {
	try {
		if (!questionId) {
			return fail("Invalid question id!");
		}
		const page = params.page || 1;
		const limit = params.limit || 5;

		const baseQuestion = await Question.findById(questionId);

		const games = await Game.find(
			{ status: "ended", "questions._id": objectId(questionId) },
			{
				_id: 1,
				endedAt: 1,
				players: 1,
				questions: 1,
			}
		)
			.sort({ endedAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		const res = games.map((game) => {
			const question = game.questions.find(
				(q) => q._id.toString() === questionId
			);
			const answers = question.answers.map((a) => {
				return {
					player: game.players.find(
						(p) => p._id.toString() === a.user_id.toString()
					),
					answer: a.answer,
					language: a.language || env.defaultLanguage,
					rate: a.rates.reduce((n, { rate }) => n + rate, 0),
				};
			});
			return {
				_id: game.id,
				endedAt: game.endedAt,
				question: {
					question: question.question,
					language: question.language || env.defaultLanguage,
					rate: question.rates.reduce((n, { rate }) => n + rate, 0),
					answers,
				},
				likes: baseQuestion.likes.length || 0,
				dislikes: baseQuestion.dislikes.length || 0,
				score: baseQuestion.score || 0,
				rates: baseQuestion.rates || 0,
				avgRate: baseQuestion.avgRate || 0,
			};
		});

		return success("ok", res);
	} catch (e) {
		return handleException(e);
	}
};

exports.questionsFromFriendsLatestGames = async (userId, params) => {
	try {
		const page = params.page || 1;
		const limit = params.limit || 5;

		const { friendsIds, friendsIdsString } = await findMyFriends(userId);

		const games = await Game.find({
			status: "ended",
			"result.scoreboard._id": { $in: friendsIds },
		})
			.sort({ endedAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		const res = games.map((game) => {
			const question = game.questions.find(({ user_id }) =>
				friendsIdsString.includes(user_id.toString())
			);

			const answer = question?.answers.find(({ user_id }) =>
				friendsIdsString.includes(user_id.toString())
			);
			return {
				gameId: game._id,
				category: game.category,
				gameType: game.gameType,
				question: question?.question,
				answer: answer?.answer,
				endedAt: game.endedAt,
			};
		});

		return success("ok", res);
	} catch (e) {
		return handleException(e);
	}
};

exports.getTransactions = async (userId, params) => {
	try {
		if (!userId) {
			return fail("invali user id");
		}
		const page = params.page || 1;
		const limit = params.limit || 5;

		const transactions = await Transaction.find({ user: objectId(userId) })
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		return success("ok", transactions);
	} catch (e) {
		return handleException(e);
	}
};

const like = async (questionId, userId) => {
	await Question.findOneAndUpdate(
		{ _id: objectId(questionId) },
		{
			$push: {
				likes: objectId(userId),
			},
		}
	);
};

const dislike = async (questionId, userId) => {
	await Question.findOneAndUpdate(
		{ _id: objectId(questionId) },
		{
			$push: {
				dislikes: objectId(userId),
			},
		}
	);
};

const removeLike = async (questionId, userId) => {
	await Question.findOneAndUpdate(
		{ _id: objectId(questionId) },
		{
			$pull: {
				likes: objectId(userId),
			},
		}
	);
};

const removeDislike = async (questionId, userId) => {
	await Question.findOneAndUpdate(
		{ _id: objectId(questionId) },
		{
			$pull: {
				dislikes: objectId(userId),
			},
		}
	);
};

/*
try {
	//
} catch (e) {
	return handleException(e);
}
*/
