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
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini", // Adjust to the latest model as necessary
			// prompt: `به این سوال به عنوان یک انسان پاسخ بده:\n${question}`,
			messages: [
				{
					role: "user",
					content: `به این سوال به عنوان یک انسان پاسخ بده:\n${question}`,
				},
			],
			// temperature: 0.5,
			max_tokens: 100,
			// stop: ["\n"],
		});
		// console.log(response);
		if (response && response.choices && response.choices.length > 0) {
			// console.log(response.choices);
			const answer = response.choices[0]?.message?.content; // .text.trim();
			return answer;
		} else {
			return "The model did not return a valid response.";
		}
	} catch (error) {
		console.error(error);
	}
};
