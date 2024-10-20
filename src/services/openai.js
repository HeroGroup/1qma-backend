// const { Configuration, OpenAIApi } = require("openai");
const { OpenAI } = require("openai");

// const configuration = new Configuration({
// 	apiKey: env.openAIApiKey,
// });
// const openai = new OpenAIApi(configuration);
const client = new OpenAI({ apiKey: env.openAIApiKey });

exports.askAI = async (question) => {
	try {
		const chatCompletion = await client.chat.completions.create({
			messages: [{ role: "user", content: question }],
			model: "gpt-3.5-turbo",
		});
		console.log(chatCompletion);

		const response = await client.chat.completions.create({
			model: "gpt-3.5-turbo", // "text-davinci-003",
			prompt: question,
			max_tokens: 50,
		});
		console.log(response.data.choices[0].text.trim());
		// return response.data.choices[0].text.trim();
	} catch (error) {
		console.error(error);
	}
};
