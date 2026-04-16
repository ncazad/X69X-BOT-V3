const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pastebin",
    aliases: ["past"],
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 6,
    category: "utility",
    shortDescription: "Upload local cmd to Pastebin via API",
    longDescription: "Uploads any file from cmds folder using API, raw link included",
    guide: {
      en: "{pn} <filename>"
    }
  },

  onStart: async function({ api, event, args }) {
    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage(
        "❌ Please provide a file name!",
        event.threadID,
        event.messageID
      );
    }

    const cmdsFolder = path.join(__dirname, "..", "cmds");
    const possibleFiles = [
      path.join(cmdsFolder, fileName),
      path.join(cmdsFolder, fileName + ".js"),
      path.join(cmdsFolder, fileName + ".txt")
    ];

    let filePath;
    for (const f of possibleFiles) {
      if (fs.existsSync(f)) {
        filePath = f;
        break;
      }
    }

    if (!filePath) {
      return api.sendMessage(
        "❌ File not found in cmds folder!",
        event.threadID,
        event.messageID
      );
    }

    try {
      const data = fs.readFileSync(filePath, "utf8");
      
      const apiURL = "https://azadx69x-all-apis-top.vercel.app/api/pastebin";
      const res = await axios.get(apiURL, { params: { query: data } });
      const result = res.data;

      if (!result.success) {
        return api.sendMessage(
          `❌ Pastebin failed: ${result.message}`,
          event.threadID,
          event.messageID
        );
      }

      const msg = `📤 Pastebin Upload\n\n🗂️ File Name: ${path.basename(filePath)}\n📄 Raw URL: ${result.result.raw_url}`;

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ Failed to upload to Pastebin via API.",
        event.threadID,
        event.messageID
      );
    }
  }
};
