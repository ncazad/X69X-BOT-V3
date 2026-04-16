const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    version: "0.0.7",
    role: 0,
    author: "Azadx69x",
    countDown: 0,
    category: "upload",
    guide: {
      en: "[reply to image or video]"
    }
  },

  onStart: async function ({ api, event }) {
    await this.uploadMedia(api, event);
  },

  uploadMedia: async function (api, event) {
    let mediaUrl;

    if (
      event.type === "message_reply" &&
      event.messageReply &&
      event.messageReply.attachments &&
      event.messageReply.attachments.length > 0
    ) {
      mediaUrl = event.messageReply.attachments[0].url;
    } else if (event.attachments && event.attachments.length > 0) {
      mediaUrl = event.attachments[0].url;
    } else {
      return api.sendMessage(
        "❌ 𝐍𝐨 𝐦𝐞𝐝𝐢𝐚 𝐝𝐞𝐭𝐞𝐜𝐭𝐞𝐝. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞/𝐯𝐢𝐝𝐞𝐨 𝐨𝐫 𝐚𝐭𝐭𝐚𝐜𝐡 𝐨𝐧𝐞.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const endpoint = `https://azadx69x-all-apis-top.vercel.app/api/imgur?url=${encodeURIComponent(mediaUrl)}`;
      const res = await axios.get(endpoint, { timeout: 20000 });
      const data = res.data;

      if (!data || data.success !== true || !data.url) {
        return api.sendMessage(
          "❌ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝 𝐨𝐫 𝐢𝐧𝐯𝐚𝐥𝐢𝐝 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐟𝐫𝐨𝐦 𝐀𝐏𝐈.",
          event.threadID,
          event.messageID
        );
      }

      const reply = [
        "✅ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥",
        `🔗 𝐔𝐑𝐋: ${data.url}`
      ].join("\n");

      return api.sendMessage(reply, event.threadID, event.messageID);

    } catch (err) {
      console.error("Imgur upload error:", err);
      return api.sendMessage(
        "❌ 𝐄𝐫𝐫𝐨𝐫 𝐮𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐦𝐞𝐝𝐢𝐚. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.",
        event.threadID,
        event.messageID
      );
    }
  }
};
