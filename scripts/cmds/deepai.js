const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "deepai",
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    countDown: 5,
    description: "Generate deepai image",
    category: "ai",
    guide: "{pn} <prompt>"
  },

  onStart: async function({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ Please provide a prompt!");

    const apiUrl = `https://azadx69x.is-a.dev/api/deepai?prompt=${encodeURIComponent(prompt)}`;

    try {
      const res = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 60000
      });

      const filePath = path.join(os.tmpdir(), `deepai_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(res.data));

      await message.reply({
        body: "🖼️ Here is your generated image",
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 15000);

    } catch (e) {
      return message.reply(`❌ Failed to generate image!\n💡 ${e.message}`);
    }
  }
};
