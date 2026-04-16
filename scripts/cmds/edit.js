const axios = require("axios");

module.exports = {
  config: {
    name: "edit",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Edit image",
    longDescription: "Reply to any image",
    category: "image",
    guide: "{pn} [text]"
  },

  onStart: async function ({ api, event, args }) {

    const react = (emoji) => api.setMessageReaction(emoji, event.messageID, () => {}, true);

    try {
      const prompt = args.join(" ");

      if (!prompt) {
        react("⚠️");
        return api.sendMessage("⚠️ | Please provide text.", event.threadID);
      }

      const imageUrl = event.messageReply?.attachments[0]?.url;

      if (!imageUrl) {
        react("🖼️");
        return api.sendMessage("🖼️ | Please reply to an image.", event.threadID);
      }

      react("⏳");

      const apiUrl = `https://azadx69x.is-a.dev/api/editor?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;

      const response = await axios.get(apiUrl, { responseType: "stream" });

      react("✅");

      api.sendMessage({
        body: `✅ Image edited successfully!\n📝 Prompt: ${prompt}`,
        attachment: response.data
      }, event.threadID);

    } catch (error) {
      console.error(error);
      react("❌");
      api.sendMessage("❌ | Failed to process image.", event.threadID);
    }
  }
};
