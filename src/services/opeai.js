const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
	apiKey: env.OpenAIApi,
});
const openai = new OpenAIApi(configuration);

exports.askAI = async (question) => {
	try {
		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: question,
			max_tokens: 50,
		});

		return response.data.choices[0].text.trim();
	} catch (error) {
		console.error(error);
	}
};
