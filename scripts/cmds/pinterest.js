const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    countDown: 5,
    description: {
      en: "Search or get images from Pinterest."
    },
    category: "image",
    guide: {
      en: "❌ 𝐔𝐬𝐞 𝐥𝐢𝐤𝐞: {pn} - <text> - [count]"
    }
  },

  onStart: async function ({ api, event, args, commandName }) {
    try {
      const input = args.join(" ").trim();
      if (!input) {
        return api.sendMessage(
          `❌ 𝐔𝐬𝐞 𝐥𝐢𝐤𝐞: ${commandName} <text> - [count]`,
          event.threadID,
          event.messageID
        );
      }

      let query = input;
      let count = 10;
      
      if (input.includes("-")) {
        const parts = input.split("-");
        query = parts[0].trim();
        count = parseInt(parts[1].trim()) || 10;
      }

      if (count > 50) count = 50;
      
      const apiUrl = `https://azadx69x-all-apis-top.vercel.app/api/pin?text=${encodeURIComponent(query)}&count=${count}`;
      const res = await axios.get(apiUrl);
      const data = res.data?.data || [];

      if (!data.length) {
        return api.sendMessage(
          `❌ No images found for "${query}".`,
          event.threadID,
          event.messageID
        );
      }
      
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      
      const attachments = [];
      for (let i = 0; i < data.length; i++) {
        try {
          const imgRes = await axios.get(data[i], { responseType: "arraybuffer" });
          const imgPath = path.join(cacheDir, `pin_${Date.now()}_${i}.png`);
          await fs.promises.writeFile(imgPath, imgRes.data);
          attachments.push(fs.createReadStream(imgPath));
        } catch (err) {
          console.error(`Failed to fetch image: ${data[i]}`, err.message);
        }
      }

      if (!attachments.length) {
        return api.sendMessage(
          `❌ Failed to fetch any images for "${query}".`,
          event.threadID,
          event.messageID
        );
      }
      
      await api.sendMessage(
        {
          body: `💫 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 Images for: "${query}"`,
          attachment: attachments
        },
        event.threadID,
        event.messageID
      );
      
      attachments.forEach(att => {
        try { fs.unlinkSync(att.path); } catch {}
      });
      if (fs.existsSync(cacheDir)) {
        await fs.promises.rm(cacheDir, { recursive: true, force: true });
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        `❌ Something went wrong. Please try again later.`,
        event.threadID,
        event.messageID
      );
    }
  }
};
