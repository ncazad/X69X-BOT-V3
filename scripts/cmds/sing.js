const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sing",
    aliases: ["song", "music"],
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: "sing from YouTube",
    category: "social",
    guide: "{pn} <song name>"
  },

  onStart: async function ({ api, args, event }) {
    const query = args.join(" ");
    
    if (!query) {
      return api.sendMessage("Provide a song name", event.threadID, event.messageID);
    }

    try {
      api.setMessageReaction("🔍", event.messageID, event.threadID, () => {}, true);
      
      const apiUrl = `https://azadx69x-all-apis-top.vercel.app/api/sing?song=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });

      if (!res.data?.success || !res.data?.audio?.url) {
        api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
        return api.sendMessage("Failed to get audio", event.threadID, event.messageID);
      }

      const { info, audio } = res.data;
      const fileName = `sing_${Date.now()}.m4a`;
      const filePath = path.join(__dirname, fileName);

      api.setMessageReaction("⬇️", event.messageID, event.threadID, () => {}, true);

      const downloadRes = await axios({
        url: audio.url,
        method: "GET",
        responseType: "arraybuffer",
        timeout: 60000,
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      fs.writeFileSync(filePath, Buffer.from(downloadRes.data));

      await api.sendMessage(
        {
          body: `${info.title}\n${info.artist}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => { 
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          api.setMessageReaction("✅", event.messageID, event.threadID, () => {}, true);
        },
        event.messageID
      );

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
      return api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
