const axios = require("axios");

module.exports = {
  config: {
    name: "nokia",
    aliases: [],
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    shortDescription: "𝐏𝐫𝐨𝐟𝐢𝐥𝐞 𝐩𝐢𝐜𝐭𝐮𝐫𝐞 𝐢𝐧𝐬𝐢𝐝𝐞 𝐚 𝐍𝐨𝐤𝐢𝐚 𝐩𝐡𝐨𝐧𝐞",
    longDescription: "𝐒𝐡𝐨𝐰𝐬 𝐚 𝐮𝐬𝐞𝐫'𝐬 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐩𝐢𝐜𝐭𝐮𝐫𝐞 𝐢𝐧𝐬𝐢𝐝𝐞 𝐚 𝐍𝐨𝐤𝐢𝐚 𝐩𝐡𝐨𝐧𝐞 𝐟𝐫𝐚𝐦𝐞",
    category: "fun",
    guide: {
      en: "{pn} (𝐫𝐞𝐩𝐥𝐲 𝐨𝐫 𝐧𝐨 𝐫𝐞𝐩𝐥𝐲)"
    }
  },

  onStart: async function ({ event, message, args, usersData }) {
    try {
      let targetID =
        (event.type === "message_reply" && event.messageReply?.senderID) || 
        (event.mentions && Object.keys(event.mentions)[0]) || 
        event.senderID;

      const name = await usersData.getName(targetID).catch(() => "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐔𝐬𝐞𝐫");
      
      const avatarURL = await usersData.getAvatarUrl(targetID);
      
      const apiURL = `https://azadx69x-all-apis-top.vercel.app/api/nokia?image=${encodeURIComponent(avatarURL)}`;
      
      const stream = await global.utils.getStreamFromURL(apiURL);
      
      const replyText = `𝐇𝐞𝐫𝐞 𝐍𝐨𝐤𝐢𝐚 𝐩𝐡𝐨𝐧𝐞 𝐨𝐟 ${name}'𝐬📱`;

      return message.reply({
        body: replyText,
        attachment: stream
      });

    } catch (err) {
      console.error("𝐍𝐎𝐊𝐈𝐀 𝐂𝐌𝐃 𝐄𝐑𝐑𝐎𝐑:", err);

      const errorText = `❌ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐟𝐞𝐭𝐜𝐡 𝐭𝐡𝐞 𝐍𝐨𝐤𝐢𝐚 𝐩𝐡𝐨𝐧𝐞 𝐢𝐦𝐚𝐠𝐞.`;
      return message.reply(errorText);
    }
  }
};
