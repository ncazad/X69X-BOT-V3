const axios = require("axios");

module.exports = {
  config: {
    name: "rbg",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Remove background reply image",
    longDescription: "Remove background URL or replying to an image",
    category: "image",
    guide: {
      en: "{p}rbg <image_url>\nOR\nReply image + {p}rbg"
    }
  },

  onStart: async function ({ api, event, args }) {
    let loadingMsg;
    try {
      let imageUrl;

      if (
        event.messageReply?.attachments?.length > 0 &&
        event.messageReply.attachments[0].type === "photo"
      ) {
        imageUrl = event.messageReply.attachments[0].url;
      }

      if (!imageUrl && args[0]) {
        imageUrl = args[0];
      }

      if (!imageUrl) {
        return api.sendMessage(
          "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐨𝐫 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐔𝐑𝐋",
          event.threadID,
          event.messageID
        );
      }
    	
      loadingMsg = await api.sendMessage(
        `😺 𝐑𝐞𝐦𝐨𝐯𝐢𝐧𝐠 𝐁𝐚𝐜𝐤𝐠𝐫𝐨𝐮𝐧𝐝...\n⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭...`,
        event.threadID
      );

      const apiUrl =
        "https://azadx69x-all-apis-top.vercel.app/api/rbg?url=" +
        encodeURIComponent(imageUrl);

      const res = await axios.get(apiUrl, { responseType: "stream" });

      await api.sendMessage(
        {
          body: "✅ 𝐁𝐚𝐜𝐤𝐠𝐫𝐨𝐮𝐧𝐝 𝐑𝐞𝐦𝐨𝐯𝐞𝐝!",
          attachment: res.data
        },
        event.threadID,
        event.messageID
      );
    	
      api.unsendMessage(loadingMsg.messageID);

    } catch (err) {
      console.error(err);
      if (loadingMsg) api.unsendMessage(loadingMsg.messageID);

      api.sendMessage(
        "❌ 𝐈𝐦𝐚𝐠𝐞 𝐏𝐫𝐨𝐜𝐞𝐬𝐬 𝐅𝐚𝐢𝐥𝐞𝐝!",
        event.threadID,
        event.messageID
      );
    }
  }
};
