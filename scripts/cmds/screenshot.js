const axios = require("axios");

module.exports = {
  config: {
    name: "screenshot",
    aliases: ["ss"],
    version: "0.0.7",
    role: 0,
    author: "Azadx69x",
    description: "Take any website screenshot",
    category: "utility",
    countDown: 5
  },

  onStart: async function ({ message, args }) {

    if (!args[0]) {
      return message.reply("❌ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐔𝐑𝐋!");
    }

    let url = encodeURIComponent(args[0]);
    const api = `https://azadx69x-all-apis-top.vercel.app/api/screenshot?url=${url}`;

    try {

      const res = await axios.get(api, {
        responseType: "stream"
      });

      message.reply({
        attachment: res.data
      });

    } catch (e) {
      console.log(e);
      message.reply("❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐭𝐚𝐤𝐞 𝐬𝐜𝐫𝐞𝐞𝐧𝐬𝐡𝐨𝐭!");
    }
  }
};
