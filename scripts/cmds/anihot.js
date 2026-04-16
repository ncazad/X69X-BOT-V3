const axios = require("axios");

module.exports = {
	config: {
		name: "anihot",
		version: "0.0.7",
		author: "Azadx69x",
		countDown: 5,
		role: 0,
		description: {
			en: "𝐆𝐞𝐭 𝐑𝐚𝐧𝐝𝐨𝐦 𝐀𝐧𝐢𝐦𝐞 𝐇𝐨𝐭 𝐈𝐦𝐚𝐠𝐞"
		},
		category: "18+",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message }) {
		try {

			const api = "https://azadx69x-all-apis-top.vercel.app/api/anihot";

			const res = await axios.get(api, {
				responseType: "stream"
			});

			return message.reply({
				body: "😋 𝐀𝐧𝐢𝐦𝐞 𝐇𝐨𝐭 𝐈𝐦𝐚𝐠𝐞",
				attachment: res.data
			});

		} catch (err) {  
			console.log(err);  
			return message.reply("❌ 𝐂𝐡𝐮𝐝𝐥𝐢𝐧𝐠 𝐏𝐨𝐧𝐠");  
		}  
	}
};
