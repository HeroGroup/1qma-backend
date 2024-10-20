const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: env.openAIApiKey });

exports.askAI = async (question) => {
	try {
		// const chatCompletion = await client.chat.completions.create({
		// 	messages: [{ role: "user", content: question }],
		// 	model: "gpt-3.5-turbo",
		// });
		// console.log(chatCompletion);

		// const response = await client.chat.completions.create({
		// 	model: "gpt-3.5-turbo", // "text-davinci-003",
		// 	prompt: question,
		// 	max_tokens: 50,
		// });
		// console.log(response.data.choices[0].text.trim());
		// return response.data.choices[0].text.trim();
		const response = await openai.completions.create({
			model: "davinci-002", // Adjust to the latest model as necessary
			prompt: `Q: ${question}\nA:`,
			temperature: 0.5,
			max_tokens: 150,
			stop: ["\n"],
		});
		if (response && response.choices && response.choices.length > 0) {
			const answer = response.choices[0].text.trim();
			return answer;
		} else {
			return "The model did not return a valid response.";
		}
	} catch (error) {
		console.error(error);
	}
};
