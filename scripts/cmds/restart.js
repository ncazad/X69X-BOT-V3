const fs = require("fs-extra");
const os = require("os");
const path = require("path");

module.exports = {
  config: {
    name: "restart",
    version: "1.6",
    author: "NTKhang (fixed by Azadx69x)",
    countDown: 5,
    role: 2,
    description: {
      en: "Restart bot"
    },
    category: "owner",
    guide: {
      en: "{pn}: Restart bot"
    }
  },
  langs: {
    en: {
      restartting: `🔄 𝐒𝐲𝐬𝐭𝐞𝐦 𝐢𝐬 𝐫𝐞𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠...
⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 𝐚 𝐦𝐨𝐦𝐞𝐧𝐭...`,
      restarted: `✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐑𝐄𝐒𝐓𝐀𝐑𝐓𝐄𝐃
━━━━━━━━━━━━━━━
⏱️ 𝐁𝐨𝐨𝐭 𝐓𝐢𝐦𝐞: {bootTime}s
⏰ 𝐔𝐩𝐭𝐢𝐦𝐞: {uptime}
📦 𝐍𝐨𝐝𝐞.𝐣𝐬: {nodeVersion}`
    }
  },

  onLoad: async function ({ api }) {
    const pathFile = path.join(__dirname, "restart.json");

    if (!fs.existsSync(pathFile)) return;

    try {
      const data = JSON.parse(fs.readFileSync(pathFile, "utf-8"));
      const { tid, time } = data;

      fs.unlinkSync(pathFile);

      const bootTime = ((Date.now() - time) / 1000).toFixed(1);
      const uptime = Math.floor(os.uptime());
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      const nodeVersion = process.version;

      const msg = `✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐑𝐄𝐒𝐓𝐀𝐑𝐓𝐄𝐃
━━━━━━━━━━━━━━━
⏱️ 𝐁𝐨𝐨𝐭 𝐓𝐢𝐦𝐞: ${bootTime}s
⏰ 𝐔𝐩𝐭𝐢𝐦𝐞: ${hours}h ${minutes}m ${seconds}s
📦 𝐍𝐨𝐝𝐞.𝐣𝐬: ${nodeVersion}`;

      setTimeout(async () => {
        try {
          await api.sendMessage(msg, tid);
          console.log(`[RESTART] Notified thread ${tid}`);
        } catch (error) {
          console.error("[RESTART] Failed to send done message:", error.message);
        }
      }, 1500);

    } catch (error) {
      console.error("[RESTART] Error in onLoad:", error.message);
      try { fs.unlinkSync(pathFile); } catch (e) {}
    }
  },

  onStart: async function ({ message, event, getLang }) {
    const pathFile = path.join(__dirname, "restart.json");

    if (fs.existsSync(pathFile)) {
      try {
        const existing = JSON.parse(fs.readFileSync(pathFile, "utf-8"));
        if (Date.now() - existing.time < 5000) return;
      } catch (e) {}
    }

    const restartData = {
      tid: event.threadID,
      uid: event.senderID,
      time: Date.now()
    };

    try {
      fs.writeFileSync(pathFile, JSON.stringify(restartData, null, 2));
      await message.reply(getLang("restartting"));

      setTimeout(() => {
        console.log("[RESTART] Exiting process...");
        process.exit(2);
      }, 1500);

    } catch (error) {
      console.error("[RESTART] Error:", error);
      return message.reply("❌ Failed to initiate restart: " + error.message);
    }
  }
};
