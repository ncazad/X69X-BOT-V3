const axios = require("axios");

module.exports = {
  config: {
    name: "slap",
    version: "1.0.0",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    shortDescription: "𝐒𝐥𝐚𝐩 𝐚 𝐮𝐬𝐞𝐫 😆",
    longDescription: "𝐒𝐥𝐚𝐩 𝐚𝐧𝐲𝐨𝐧𝐞 𝐰𝐢𝐭𝐡 𝐚 𝐟𝐮𝐧𝐧𝐲 𝐢𝐦𝐚𝐠𝐞",
    category: "fun",
    guide: {
      en: "{pn} @mention / reply"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      const senderID = event.senderID;

      let targetID =
        (event.type === "message_reply" && event.messageReply?.senderID) ||
        (event.mentions && Object.keys(event.mentions)[0]);

      if (!targetID) {
        return message.reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐬𝐨𝐦𝐞𝐨𝐧𝐞!");
      }

      const name1 = await usersData.getName(senderID).catch(() => "User");
      const name2 = await usersData.getName(targetID).catch(() => "User");

      const avatar1 = await usersData.getAvatarUrl(senderID);
      const avatar2 = await usersData.getAvatarUrl(targetID);

      const apiURL = `https://azadx69x-all-apis-top.vercel.app/api/slap?avatar1=${encodeURIComponent(
        avatar1
      )}&avatar2=${encodeURIComponent(avatar2)}`;

      const stream = await global.utils.getStreamFromURL(apiURL);

      const replyText = `🤣 ${name1} 𝐬𝐥𝐚𝐩𝐩𝐞𝐝 ${name2}!`;

      return message.reply({
        body: replyText,
        attachment: stream
      });

    } catch (err) {
      console.error("SLAP CMD ERROR:", err);
      return message.reply("❌ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐟𝐞𝐭𝐜𝐡 𝐬𝐥𝐚𝐩 𝐢𝐦𝐚𝐠𝐞.");
    }
  }
};
