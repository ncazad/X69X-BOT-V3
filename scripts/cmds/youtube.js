const ytSearch = require("yt-search");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_BASE = process.env.API_BASE || "https://azadx69x-ytb-api.vercel.app";

async function fetchStream(url) {
  const res = await axios({ url, responseType: "stream" });
  return res.data;
}

module.exports = {
  config: {
    name: "youtube",
    aliases: ["ytb"],
    version: "1.1.1",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: { en: "Search and download YouTube video/audio" },
    category: "media",
    guide: { en: "{pn} -v <query|url>\n{pn} -a <query|url>" }
  },

  onStart: async function ({ api, args, event, commandName }) {
    try {
      const typeFlag = args[0];
      if (!["-v", "-a"].includes(typeFlag)) {
        return api.sendMessage(
          "❌ Usage:\n)ytb -v <query|url>\n)ytb -a <query|url>",
          event.threadID,
          event.messageID
        );
      }

      const query = args.slice(1).join(" ");
      if (!query) {
        return api.sendMessage(
          "❌ Provide a search query or YouTube URL.",
          event.threadID,
          event.messageID
        );
      }
      
      if (query.startsWith("http")) {
        return await downloadMedia(
          query,
          typeFlag === "-v" ? "mp4" : "mp3",
          api,
          event
        );
      }
      
      const searchRes = await ytSearch(query);
      const results = searchRes.videos.slice(0, 6);

      if (!results.length) {
        return api.sendMessage(
          "❌ No results found.",
          event.threadID,
          event.messageID
        );
      }

      let msg = "🎵 YouTube Results\n\n";
      results.forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n⏱ ${v.timestamp}\n\n`;
      });
      msg += "Reply with number (1-6) to download.";

      const attachments = await Promise.all(
        results.map(v => fetchStream(v.thumbnail))
      );

      api.sendMessage(
        { body: msg, attachment: attachments },
        event.threadID,
        (err, sent) => {
          if (err) return console.error(err);
          global.GoatBot.onReply.set(sent.messageID, {
            commandName,
            results,
            type: typeFlag,
            messageID: sent.messageID
          });
        },
        event.messageID
      );

    } catch (err) {
      console.error("[YT] onStart error:", err);
      api.sendMessage(
        "❌ Failed to execute YouTube command.",
        event.threadID,
        event.messageID
      );
    }
  },

  onReply: async function ({ event, api, Reply }) {
    try {
      const { results, type, messageID } = Reply;
      const choice = parseInt(event.body);

      if (isNaN(choice) || choice < 1 || choice > results.length) {
        return api.sendMessage(
          "❌ Invalid choice. Reply 1-6.",
          event.threadID,
          event.messageID
        );
      }

      await api.unsendMessage(messageID);
      const selected = results[choice - 1];

      await downloadMedia(
        selected.url,
        type === "-v" ? "mp4" : "mp3",
        api,
        event
      );

    } catch (err) {
      console.error("[YT] onReply error:", err);
      api.sendMessage(
        "❌ Error processing selection.",
        event.threadID,
        event.messageID
      );
    }
  }
};

async function downloadMedia(url, type, api, event) {
  try {
    const res = await axios.get(
      `${API_BASE}/download?url=${encodeURIComponent(url)}&type=${type}`,
      { responseType: "stream" }
    );

    const fileName = `yt_${Date.now()}.${type}`;
    const filePath = path.join(__dirname, fileName);
    const writer = fs.createWriteStream(filePath);

    res.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await api.sendMessage(
      { attachment: fs.createReadStream(filePath) },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );

  } catch (err) {
    console.error("[YT] download error:", err);
    api.sendMessage(
      `❌ Failed to download ${type}.`,
      event.threadID,
      event.messageID
    );
  }
}
