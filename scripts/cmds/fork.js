const axios = require("axios");

module.exports = {
  config: {
    name: "fork",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    category: "system",
    shortDescription: "𝐆𝐢𝐭𝐇𝐮𝐛 𝐅𝐨𝐫𝐤",
    longDescription: "𝐅𝐞𝐭𝐜𝐡 𝐟𝐨𝐫𝐤",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      const repo = "ncazad/X69X-BOT-V3";

      const res = await axios.get(`https://api.github.com/repos/${repo}`);
      const data = res.data;

      const text = `
𝐗69𝐗 𝐁𝐎𝐓 𝐕3
𝐔𝐩𝐝𝐚𝐭𝐞 𝐅𝐨𝐫𝐤

📦 𝐍𝐚𝐦𝐞: ${data.name}
👑 𝐎𝐰𝐧𝐞𝐫: ${data.owner.login}
🍴 𝐅𝐨𝐫𝐤𝐬: ${data.forks_count}
⭐ 𝐒𝐭𝐚𝐫𝐬: ${data.stargazers_count}
👀 𝐖𝐚𝐭𝐜𝐡𝐞𝐫𝐬: ${data.watchers_count}

🔗 𝐅𝐨𝐫𝐤 𝐋𝐢𝐧𝐤:
${data.html_url}
`;

      return message.reply(text);

    } catch (err) {
      console.error("FORK CMD ERROR:", err);
      return message.reply("❌ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐟𝐞𝐭𝐜𝐡 𝐟𝐨𝐫𝐤.");
    }
  }
};
