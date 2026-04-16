const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upscale image to 4K" },
    longDescription: { en: "Reply to any image" },
    category: "image",
    guide: { en: "Reply to image or type !4k <image_url>" }
  },

  onStart: async function ({ api, event, args, message }) {
    let loadingMsg;
    try {
      let imageUrl;
      if (
        event.type === "message_reply" &&
        event.messageReply.attachments &&
        event.messageReply.attachments.length > 0
      ) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args[0] && args[0].startsWith("http")) {
        imageUrl = args[0];
      } else {
        return message.reply(
          "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐨𝐫 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐢𝐦𝐚𝐠𝐞 𝐔𝐑𝐋.",
          event.threadID,
          () => {},
          true
        );
      }
      
      loadingMsg = await message.reply(
        `😺 𝐁𝐨𝐬𝐬 - 𝟒𝐊 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠...\n⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭...`,
        event.threadID,
        () => {},
        true
      );
      
      const apiUrl = `https://azadx69x-4k-apis.vercel.app/api/4k?imgUrl=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      if (response.data.status !== "success" || !response.data.upscaledImage) {
        throw new Error("Upscale failed");
      }

      const upscaledImageUrl = response.data.upscaledImage;
      
      const imageResponse = await axios({
        method: "GET",
        url: upscaledImageUrl,
        responseType: "stream",
        timeout: 30000
      });

      const filePath = path.join(__dirname, `/cache/upscaled_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(filePath);
      imageResponse.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", async () => {
          api.setMessageReaction("✅", event.messageID, event.threadID, () => {}, true);
          api.unsendMessage(loadingMsg.messageID);

          message.reply(
            {
              body: `✅ 𝐈𝐦𝐚𝐠𝐞 𝐔𝐩𝐬𝐜𝐚𝐥𝐞𝐝 𝐓𝐨 𝟒𝐊 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!`,
              attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => {
              fs.unlinkSync(filePath);
              resolve();
            },
            true
          );
        });

        writer.on("error", (err) => {
          api.unsendMessage(loadingMsg.messageID);
          message.reply(
            "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐓𝐨 𝐒𝐚𝐯𝐞 𝐈𝐦𝐚𝐠𝐞.",
            event.threadID,
            () => {},
            true
          );
          reject(err);
        });
      });

    } catch (error) {
      console.error("Upscale error:", error);
      if (loadingMsg) api.unsendMessage(loadingMsg.messageID);

      message.reply(
        "❌ 𝟒𝐊 𝐔𝐩𝐬𝐜𝐚𝐥𝐞 𝐅𝐚𝐢𝐥𝐞𝐝. 𝐓𝐫𝐲 𝐀𝐠𝐚𝐢𝐧.",
        event.threadID,
        () => {},
        true
      );
    }
  }
};
