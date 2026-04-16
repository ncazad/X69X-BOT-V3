const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt"],
    version: "1.0",
    author: "Azadx69x",
    role: 0,
    shortDescription: "Fetch a TikTok video with stats",
    longDescription: "Search TikTok and directly send one video with likes, comments, shares",
    category: "media",
  },

  onStart: async function({ message, args }) {
    return this.run({ message, args });
  },

  onChat: async function({ message, args, event }) {
    const body = (event.body || "").toLowerCase();
    if (!body.startsWith("tt ") && !body.startsWith("tiktok ")) return;
    args = body.split(" ").slice(1);
    return this.run({ message, args });
  },

  run: async function({ message, args }) {
    try {
      const query = args.join(" ").trim();
      if (!query) return message.reply("⚠️ Please enter a search keyword!");

      await message.reply(`🔍 Searching for "${query}"...`);
      
      const apiUrl = `https://azadx69x-all-apis-top.vercel.app/api/tiktok?query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      if (!data?.data || !data.data.length) {
        return message.reply("❌ No video found!");
      }
      
      const videos = data.data.slice(0, 10);
      const video = videos[Math.floor(Math.random() * videos.length)];
      
      const videoUrl = video.video_url.replace(/^\[|\]$/g, "");
      const filePath = path.join(__dirname, `tiktok_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(filePath);
      const response = await axios({ url: videoUrl, method: "GET", responseType: "stream" });
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const hashtags = video.title.match(/#[\w]+/g)?.join(" ") || "None";
        
        await message.reply({
          body:
`🎞️ Title: ${video.title}
👤 Creator: ${video.author}
🏷️ Hashtags: ${hashtags}
❤️ Likes: ${video.stats.likes} | 💬 Comments: ${video.stats.comments} | 🔁 Shares: ${video.stats.shares}`,
          attachment: fs.createReadStream(filePath),
        });

        fs.unlinkSync(filePath);
      });

      writer.on("error", () => message.reply("❌ Error downloading video!"));

    } catch (err) {
      console.error("TikTok error:", err);
      return message.reply("❌ Error fetching video!");
    }
  }
};
