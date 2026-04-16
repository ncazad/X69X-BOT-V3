const axios = require("axios");

async function downloadVideo(api, event, url) {
 const { threadID, messageID } = event;
 
 try {
   api.setMessageReaction("📥", messageID, () => {}, true);
 } catch(e) {}
 
 console.log(`[ALDL] Fast downloading: ${url}`);
 
 const apiUrl = `https://azadx69x-alldl-cdi-bai.vercel.app/alldl?url=${encodeURIComponent(url)}&quality=sd`;
 
 try {
   const res = await axios.get(apiUrl, {
     responseType: "stream",
     timeout: 60000,      
     maxContentLength: 50 * 1024 * 1024,
     maxBodyLength: 50 * 1024 * 1024,
     headers: {
       'Accept': '*/*',
       'Connection': 'keep-alive'
     },
     decompress: true,
     httpAgent: new (require('http').Agent)({ keepAlive: true }),
     httpsAgent: new (require('https').Agent)({ keepAlive: true })
   });

   if (!res.data) throw new Error("Empty response");

   const msg = `╭〔 𝗩𝗜𝗗𝗘𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 〕\n├‣ ✅ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲\n╰‣ 🤖 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯`;

   api.sendMessage({
     body: msg,
     attachment: res.data
   }, threadID, (err) => {
     if (!err) {
       try {
         api.setMessageReaction("✅", messageID, () => {}, true);
       } catch(e) {}
     }
   });
   
   console.log(`[ALDL] Fast success: ${url}`);
   
 } catch (err) {
   console.error("[ALDL Error]", err.message);
   
   try {
     api.setMessageReaction("❌", messageID, () => {}, true);
   } catch(e) {
     api.sendMessage("❌ Download failed!", threadID, messageID);
   }
 }
}

module.exports = {
 config: {
   name: "alldl",
   version: "0.0.7",
   author: "Azadx69x",
   role: 0,
   category: "media",
   description: "Fast video download from FB, TikTok, IG, YouTube"
 },
 
 onStart: async function ({ api, event, args }) {
   let url = null;
   
   if (event.messageReply) {
     const replyBody = event.messageReply.body || "";
     const replyAttachments = event.messageReply.attachments || [];
     
     const bodyMatch = replyBody.match(/(https?:\/\/[^\s]+)/g);
     if (bodyMatch) url = bodyMatch[0];
     
     if (!url && replyAttachments.length > 0) {
       const att = replyAttachments[0];
       if (att.type === "video" || att.type === "share") {
         url = att.url || att.source || att.playable_url;
       }
     }
   }
   
   if (!url && args[0]) {
     url = args[0];
   }
   
   if (!url && event.body) {
     const match = event.body.match(/(https?:\/\/[^\s]+)/g);
     if (match) url = match[0];
   }
   
   if (!url) {
     return api.sendMessage("❌ No URL found!\nUsage: /alldl <url> or reply 'alldl' to a video", event.threadID, event.messageID);
   }

   const valid = ["facebook", "fb.watch", "tiktok", "instagram", "youtu", "youtube"];
   if (!valid.some(d => url.includes(d))) {
     return api.sendMessage("❌ Unsupported URL!", event.threadID, event.messageID);
   }

   downloadVideo(api, event, url);
 },
 
 onChat: async function ({ api, event }) {
   if (!event.body) return;
   
   const match = event.body.match(/(https?:\/\/[^\s]+)/g);
   if (!match) return;
   
   const url = match[0];
   const valid = ["facebook", "fb.watch", "tiktok", "instagram", "youtu"];
   if (!valid.some(d => url.includes(d))) return;
   
   downloadVideo(api, event, url);
 }
};
