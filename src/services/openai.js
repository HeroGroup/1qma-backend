const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: env.openAIApiKey });

exports.askAI = async (question, numberOfAnswers = 3) => {
	try {
		const content = `به سوال زیر به عنوان ${numberOfAnswers} انسان متفاوت با سطح سواد عادی ولی متفاوت و تا حدود کمی عمیق با لحنی کاملا دوستانه و عامیانه جواب بده و جواب ها رو با مجموعه کاراکتر "-!-" از هم جدا کن.
		${question}
نکته مهم این هست که یک راست به سراغ جواب دادن برو و جوری جواب رو تایپ کن که انگار از یک انسان پرسیده شده و به دور از کلیشه و جملات خسته کننده باشه
نکته مهم دیگه از آپشن های رایج متنی استفاده نکن یعنی عنوان رو پررنگ نکن و کل متن با یک خصوصیت متنی بنویس
و نکته مهم تر اینکه جوابها به صورتی باشد که سه دیدگاه متفاوت رو بازسازی کند و نهایتا هر جواب ۴۰ کلمه باشد`;
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini", // Adjust to the latest model as necessary
			messages: [
				{
					role: "user",
					content,
					// content: `به این سوال به عنوان یک انسان حداکثر در ۳۰ کلمه پاسخ بده:\n${question}`,
				},
			],
		});
		console.log("response", response);
		if (response && response.choices && response.choices.length > 0) {
			console.log("choices", response.choices);
			const answer = response.choices[0]?.message?.content; // .text.trim();
			return answer;
		} else {
			return "The model did not return a valid response.";
		}
	} catch (error) {
		console.error(error);
	}
};
