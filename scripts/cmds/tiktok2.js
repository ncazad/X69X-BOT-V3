const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok2",
    aliases: ["tt2"],
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    shortDescription: "Search and download TikTok videos",
    longDescription: "TikTok video search (12 per page)",
    category: "media",
    guide: "{p}tiktok <keyword>"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage("😺 𝐁𝐨𝐬𝐬 - 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐞𝐚𝐫𝐜𝐡 𝐤𝐞𝐲𝐰𝐨𝐫𝐝!", event.threadID, event.messageID);

    try { api.setMessageReaction("⌛", event.messageID, event.threadID, () => {}); } catch {}

    try {
      const res = await axios.get(`https://azadx69x-tiktok-api.vercel.app/tiktok/search?query=${encodeURIComponent(query)}`, { timeout: 15000 });
      const data = res.data.list || [];
      if (!data.length) {
        try { api.setMessageReaction("❌", event.messageID, event.threadID, () => {}); } catch {}
        return api.sendMessage("😿 𝐁𝐨𝐬𝐬 - 𝐍𝐨 𝐓𝐢𝐤𝐓𝐨𝐤 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝!", event.threadID, event.messageID);
      }

      try { api.setMessageReaction("✔️", event.messageID, event.threadID, () => {}); } catch {}
      const allResults = data.slice(0, 36);
      await sendPage(api, event, allResults, 1, query);

    } catch (err) {
      console.error("Fetch error:", err?.message || err);
      try { api.setMessageReaction("❌", event.messageID, event.threadID, () => {}); } catch {}
      api.sendMessage("😿 𝐁𝐨𝐬𝐬 - 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐓𝐢𝐤𝐓𝐨𝐤 𝐫𝐞𝐬𝐮𝐥𝐭𝐬.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event }) {
    let data = global.GoatBot.onReply.get(event.messageReply?.messageID);
    
    if (!data && event.messageReply) {
      data = global.GoatBot.onReply.get(event.messageReply.messageID);
    }
    
    if (!data) return;
    
    if (event.senderID !== data.author) return;

    const body = (event.body || "").trim().toLowerCase();
    if (!body) return;

    try { api.setMessageReaction("⌛", event.messageID, event.threadID, () => {}); } catch {}

    if (body === "next") {
      const nextPage = data.page + 1;
      const maxPage = Math.ceil(data.results.length / 12);
      if (nextPage > maxPage) {
        try { api.setMessageReaction("❌", event.messageID, event.threadID, () => {}); } catch {}
        return api.sendMessage("😿 𝐁𝐨𝐬𝐬 - 𝐍𝐨 𝐦𝐨𝐫𝐞 𝐫𝐞𝐬𝐮𝐥𝐭𝐬!", event.threadID, event.messageID);
      }
      try { api.unsendMessage(data.resultMsgID); } catch {}
      return sendPage(api, event, data.results, nextPage, data.query);
    }

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > 12) {
      try { api.setMessageReaction("❌", event.messageID, event.threadID, () => {}); } catch {}
      return api.sendMessage("😺 𝐁𝐨𝐬𝐬 - 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 (𝟏–𝟏𝟐) 𝐨𝐫 '𝐧𝐞𝐱𝐭'.", event.threadID, event.messageID);
    }

    const index = (data.page - 1) * 12 + (choice - 1);
    const selected = data.results[index];
    if (!selected) {
      try { api.setMessageReaction("❌", event.messageID, event.threadID, () => {}); } catch {}
      return api.sendMessage("😿 𝐁𝐨𝐬𝐬 - 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐜𝐡𝐨𝐢𝐜𝐞!", event.threadID, event.messageID);
    }

    try { api.unsendMessage(data.resultMsgID); } catch {}
    
    global.GoatBot.onReply.delete(data.resultMsgID);
    
    const filePath = path.join(__dirname, `cache_tt_video_${event.senderID}_${Date.now()}.mp4`);
    
    try {
      const videoUrl = selected.noWatermark || selected.play || selected.wmplay || selected.video;
      if (!videoUrl) throw new Error("No video URL found");

      const videoRes = await axios.get(videoUrl, { 
        responseType: "arraybuffer", 
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      fs.writeFileSync(filePath, Buffer.from(videoRes.data, "binary"));

      try { api.setMessageReaction("✔️", event.messageID, event.threadID, () => {}); } catch {}
      
      api.sendMessage(
        {
          body: `🎀 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐓𝐢𝐤𝐓𝐨𝐤 𝐯𝐢𝐝𝐞𝐨`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        (err) => { 
          try { fs.unlinkSync(filePath); } catch {}; 
          if (err) console.error("Send error:", err); 
        },
        event.messageID
      );

    } catch (err) {
      console.error("Download send error:", err?.message || err);
      try { fs.unlinkSync(filePath); } catch {}
      try { api.setMessageReaction("❌", event.messageID, event.threadID, () => {}); } catch {}
      api.sendMessage("😿 𝐁𝐨𝐬𝐬 - 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐨𝐫 𝐬𝐞𝐧𝐝 𝐓𝐢𝐤𝐓𝐨𝐤 𝐯𝐢𝐝𝐞𝐨.", event.threadID, event.messageID);
    }
  }
};

async function sendPage(api, event, allResults, page, query) {
  const start = (page - 1) * 12;
  const end = start + 12;
  const pageResults = allResults.slice(start, end);

  let message = `𝐓𝐢𝐤𝐓𝐨𝐤 𝐑𝐞𝐬𝐮𝐥𝐭𝐬 (${query}) - 𝐏𝐚𝐠𝐞 ${page}\n\n`;
  const attachments = [];
  const tempFiles = [];

  for (let i = 0; i < pageResults.length; i++) {
    const v = pageResults[i];
    const shortTitle = v.title?.length > 45 ? v.title.slice(0, 45) + "..." : v.title || "Untitled";
    
    const num = i + 1 < 10 ? `𝟎${i + 1}` : `${i + 1}`;
    message += `${num}. ${shortTitle}\n\n`;

    try {
      const imgPath = path.join(__dirname, `cache_tt_${event.senderID}_${page}_${i}_${Date.now()}.jpg`);
      const imgRes = await axios.get(v.cover || v.avatar, { 
        responseType: "arraybuffer", 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));
      attachments.push(fs.createReadStream(imgPath));
      tempFiles.push(imgPath);
    } catch (e) {
      console.error("Cover fetch failed:", e.message);
    }
  }

  message += "👉 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 (𝟏–𝟏𝟐) 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝.\n🔜 𝐓𝐲𝐩𝐞 '𝐧𝐞𝐱𝐭' 𝐟𝐨𝐫 𝐦𝐨𝐫𝐞 𝐫𝐞𝐬𝐮𝐥𝐭𝐬.";

  return new Promise((resolve) => {
    api.sendMessage(
      { body: message.trim(), attachment: attachments.length ? attachments : undefined },
      event.threadID,
      (err, info) => {
        setTimeout(() => {
          tempFiles.forEach((file) => { 
            try { fs.unlinkSync(file); } catch {} 
          });
        }, 60000);

        if (err) {
          console.error("Send page error:", err);
          return resolve();
        }

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "tiktok2",
          author: event.senderID,
          results: allResults,
          query,
          page,
          resultMsgID: info.messageID
        });

        resolve();
      },
      event.messageID
    );
  });
}
