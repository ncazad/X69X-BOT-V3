const axios = require('axios');
const fs = require('fs');
const path = require('path');
module.exports = {
    config: {
        name: "similar",
        version: "1.1.0",
        author: "Azadx69x | Fix: Fahad",
        countDown: 8,
        role: 0,
        description: "🔍 Search similar images using reverse image search",
        category: "image",
        guide: {
            vi: "{pn} [reply ảnh/link ảnh]",
            en: "{pn} [reply image/image link]"
        }
    },
    onStart: async function ({ api, event, args, message }) {
        const { threadID, messageID, messageReply } = event;
        let imageUrl;
        if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
            if (messageReply.attachments[0].type === "photo") imageUrl = messageReply.attachments[0].url;
        } else if (args[0] && args[0].startsWith("http")) {
            imageUrl = args[0];
        } else if (event.attachments && event.attachments.length > 0) {
            if (event.attachments[0].type === "photo") imageUrl = event.attachments[0].url;
        }
        if (!imageUrl) {
            return message.reply("❌ Please reply to an image, provide a valid URL, or attach an image!");
        }
        api.setMessageReaction("⏳", messageID, () => {}, true);
        try {
            const apiUrl = `https://azadx69x.is-a.dev/api/similar?url=${encodeURIComponent(imageUrl)}`;
            const response = await axios.get(apiUrl, { timeout: 15000 });

            if (!response.data || !response.data.results || response.data.results.length === 0) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return message.reply("❌ No similar images found!");
            }
            const results = response.data.results.slice(0, 4); 
            const attachments = [];
            const tempFiles = [];
            for (let i = 0; i < results.length; i++) {
                try {
                    const imgUrl = results[i].image;
                    const tempPath = path.join(__dirname, `cache`, `similar_${Date.now()}_${i}.jpg`);
                    if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));
                    const imgResponse = await axios({
                        method: 'get',
                        url: imgUrl,
                        responseType: 'stream',
                        timeout: 10000, 
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    const writer = fs.createWriteStream(tempPath);
                    imgResponse.data.pipe(writer);
                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });
                    attachments.push(fs.createReadStream(tempPath));
                    tempFiles.push(tempPath);
                } catch (e) {
                    console.error(`Skipping image ${i} due to error.`);
                }
            }
            if (attachments.length === 0) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return message.reply("❌ Failed to download any similar images.");
            }
            api.setMessageReaction("✅", messageID, () => {}, true);
            api.sendMessage({
                body: `🔍 Found ${attachments.length} similar images:`,
                attachment: attachments
            }, threadID, (err) => {
                tempFiles.forEach(file => {
                    if (fs.existsSync(file)) fs.unlinkSync(file);
                });
                if (err) console.error("Send Error:", err);
            }, messageID);
        } catch (error) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return message.reply("⚠️ The search service is currently timed out. Please try again later.");
        }
    }
};
