const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const recentPairs = new Map();

module.exports = {
  config: {
    name: "pair",
    author: "Azadx69x",
    version: "0.0.7",
    role: 0,
    shortDescription: "Pair",
    longDescription: "pair",
    category: "love",
    guide: "{pn} or {pn} @mention"
  },

  downloadWithRetry: async function(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 15000,
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
          }
        });
        return response;
      } catch (error) {
        if (error.response?.status === 429) {
          const waitTime = delay * Math.pow(2, i);
          console.log(`Rate limited, waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries reached");
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions } = event;
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const pathAvt1 = path.join(cacheDir, `avt1_${Date.now()}.png`);
    const pathAvt2 = path.join(cacheDir, `avt2_${Date.now()}.png`);
    const pathImg = path.join(cacheDir, `pair_${Date.now()}.png`);

    try {
      let id1 = senderID, id2, name2;

      const ThreadInfo = await api.getThreadInfo(threadID);
      const all = ThreadInfo.userInfo;
      const senderInfo = all.find(u => u.id == id1);
      const senderGender = senderInfo ? senderInfo.gender : null;

      if (!senderGender || (senderGender !== "MALE" && senderGender !== "FEMALE")) {
        return api.sendMessage("❌ Could not determine your gender! Please ensure your Facebook profile has gender set to Male or Female.", threadID, messageID);
      }

      if (Object.keys(mentions).length > 0) {
        id2 = Object.keys(mentions)[0];
        const mentionedUser = all.find(u => u.id == id2);
        const mentionedGender = mentionedUser ? mentionedUser.gender : null;
        
        if (senderGender === mentionedGender) {
          return api.sendMessage(
            senderGender === "MALE" 
              ? "❌ You can't pair with another boy! 💔\nOnly Boys ↔️ Girls matching allowed!" 
              : "❌ You can't pair with another girl! 💔\nOnly Girls ↔️ Boys matching allowed!", 
            threadID, messageID
          );
        }

        const mentionedName = mentions[id2].replace("@", "");
        
        let userInfoData;
        try {
          userInfoData = await api.getUserInfo([id1, id2]);
        } catch (e) {
          userInfoData = {};
        }
        
        const name1 = userInfoData[id1]?.name || "You";
        const name2 = mentionedName || userInfoData[id2]?.name || "Someone";
        
        return await this.createAndSendPair(api, threadID, messageID, id1, id2, name1, name2, pathAvt1, pathAvt2, pathImg);
      }

      let targetGender = senderGender === "MALE" ? "FEMALE" : "MALE";
      let candidates = all.filter(u => u.gender === targetGender && u.id !== id1);

      if (candidates.length === 0) {
        const genderText = senderGender === "MALE" ? "girls" : "boys";
        return api.sendMessage(`❌ No ${genderText} found in this group to pair with!`, threadID, messageID);
      }

      const userKey = `${threadID}_${id1}`;
      let recentList = recentPairs.get(userKey) || [];
      
      let availableCandidates = candidates.filter(u => !recentList.includes(u.id));
      
      if (availableCandidates.length === 0) {
        recentList = [];
        availableCandidates = candidates;
      }

      const randomUser = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
      id2 = randomUser.id;
      name2 = randomUser.name;

      recentList.push(id2);
      if (recentList.length > 5) recentList.shift();
      recentPairs.set(userKey, recentList);

      let userInfoData;
      try {
        userInfoData = await api.getUserInfo([id1, id2]);
      } catch (e) {
        userInfoData = {};
      }
      
      const name1 = userInfoData[id1]?.name || "You";
      if (!name2) name2 = userInfoData[id2]?.name || "Someone";

      return await this.createAndSendPair(api, threadID, messageID, id1, id2, name1, name2, pathAvt1, pathAvt2, pathImg);

    } catch (error) {
      console.error("Pair Error:", error);
      if (fs.existsSync(pathAvt1)) fs.removeSync(pathAvt1);
      if (fs.existsSync(pathAvt2)) fs.removeSync(pathAvt2);
      if (fs.exists.existsSync(pathImg)) fs.removeSync(pathImg);
      
      if (error.response?.status === 429) {
        return api.sendMessage("⏳ Rate limited Facebook API. Please wait a few minutes and try again!", threadID, messageID);
      }
      if (error.message && error.message.includes("updatedAt")) {
        return api.sendMessage("❌ Database conflict error. Please try again in a few seconds!", threadID, messageID);
      }
      return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  },

  createAndSendPair: async function(api, threadID, messageID, id1, id2, name1, name2, pathAvt1, pathAvt2, pathImg) {
    let avt1Data, avt2Data;

    try {
      const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      
      const avt1Url = `https://graph.facebook.com/${id1}/picture?width=1024&height=1024&access_token=${token}`;
      const avt2Url = `https://graph.facebook.com/${id2}/picture?width=1024&height=1024&access_token=${token}`;
      
      avt1Data = await this.downloadWithRetry(avt1Url, 3, 2000);
      avt2Data = await this.downloadWithRetry(avt2Url, 3, 2000);

      fs.writeFileSync(pathAvt1, Buffer.from(avt1Data.data));
      fs.writeFileSync(pathAvt2, Buffer.from(avt2Data.data));

      const baseUrl = "https://i.imgur.com/LqWKIyW.jpeg";
      const baseRes = await this.downloadWithRetry(baseUrl);
      fs.writeFileSync(pathImg, Buffer.from(baseRes.data));

      const baseImage = await loadImage(pathImg);
      const avt1 = await loadImage(pathAvt1);
      const avt2 = await loadImage(pathAvt2);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      function drawRoundedImage(ctx, img, x, y, size, radius){
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x+radius,y);
        ctx.lineTo(x+size-radius,y);
        ctx.quadraticCurveTo(x+size,y,x+size,y+radius);
        ctx.lineTo(x+size,y+size-radius);
        ctx.quadraticCurveTo(x+size,y+size,x+size-radius,y+size);
        ctx.lineTo(x+radius,y+size);
        ctx.quadraticCurveTo(x,y+size,x,y+size-radius);
        ctx.lineTo(x,y+radius);
        ctx.quadraticCurveTo(x,y,x+radius,y);
        ctx.closePath();
        ctx.clip();
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawRoundedImage(ctx, avt1, 68, 98, 180, 20);
      drawRoundedImage(ctx, avt2, 478, 93, 180, 20);

      const textY1 = 98 + 180 + 8;
      const textY2 = 93 + 180 + 8;

      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.beginPath(); ctx.roundRect(68, textY1, 180, 42, 5); ctx.fill();
      ctx.beginPath(); ctx.roundRect(478, textY2, 180, 42, 5); ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center"; 
      ctx.textBaseline = "middle";

      const displayName1 = name1.length > 12 ? name1.substring(0, 12) + "..." : name1;
      const displayName2 = name2.length > 12 ? name2.substring(0, 12) + "..." : name2;

      ctx.fillText(displayName1, 68 + 180/2, textY1 + 42/2);
      ctx.fillText(displayName2, 478 + 180/2, textY2 + 42/2);

      const out = fs.createWriteStream(pathImg);
      const stream = canvas.createPNGStream({
        compressionLevel: 3,
        filters: canvas.PNG_FILTER_ALL
      });
      stream.pipe(out);
      await new Promise((resolve, reject) => {
        out.on("finish", resolve);
        out.on("error", reject);
      });

      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);

      return api.sendMessage({
        attachment: fs.createReadStream(pathImg)
      }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch(error) {
      console.error("Create Pair Error:", error);
      if (fs.existsSync(pathAvt1)) fs.removeSync(pathAvt1);
      if (fs.existsSync(pathAvt2)) fs.removeSync(pathAvt2);
      if (fs.existsSync(pathImg)) fs.removeSync(pathImg);
      throw error;
    }
  }
};
