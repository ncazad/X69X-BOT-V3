const axios = require("axios");

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cb"],
    version: "1.0.4",
    role: 0,
    author: "Azadx69x",
    countDown: 0,
    category: "upload",
    guide: {
      en: "[reply with media or send a URL]"
    }
  },

  onStart: async function ({ api, event, args }) {
    await this.uploadMedia(api, event, args);
  },

  uploadMedia: async function (api, event, args) {
    let mediaUrl;
    
    const urlArg = args.join(" ");
    if (urlArg && /^https?:\/\//i.test(urlArg)) {
      mediaUrl = urlArg;
    }
    else if (
      event.type === "message_reply" &&
      event.messageReply &&
      event.messageReply.attachments &&
      event.messageReply.attachments.length > 0
    ) {
      mediaUrl = event.messageReply.attachments[0].url;
    }
    else if (event.attachments && event.attachments.length > 0) {
      mediaUrl = event.attachments[0].url;
    }
    else {
      return api.sendMessage(
        "❌ No media detected. Please reply to media, attach one, or send a valid URL.",
        event.threadID,
        event.messageID
      );
    }

    try {
      const endpoint = `https://azadx69x-all-apis-top.vercel.app/api/catbox?url=${encodeURIComponent(mediaUrl)}`;
      const res = await axios.get(endpoint, { timeout: 20000 });
      const data = res.data;

      if (!data || !data.url) {
        return api.sendMessage(
          "❌ Upload failed or invalid response from API.",
          event.threadID,
          event.messageID
        );
      }

      const reply = [
        "✅ Upload Successful",
        `🔗 URL: ${data.url}`
      ].join("\n");

      return api.sendMessage(reply, event.threadID, event.messageID);
    } catch (err) {
      console.error("Catbox API error:", err);
      return api.sendMessage(
        "❌ Error uploading media. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
