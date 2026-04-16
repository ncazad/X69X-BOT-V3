module.exports = {
  config: {
    name: "spy",
    version: "0.0.7",
    role: 0,
    author: "Azadx69x",
    description: "Get user information and profile photo",
    category: "information",
    countDown: 5,
  },

  onStart: async function ({ event, message, usersData, api, args, threadsData }) {
    try {
      const uid1 = event.senderID;
      const uid2 = Object.keys(event.mentions)[0];
      let uid;

      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const match = args[0].match(/profile\.php\?id=(\d+)/);
          if (match) uid = match[1];
        }
      }

      if (!uid) {
        uid = event.type === "message_reply"
          ? event.messageReply.senderID
          : uid2 || uid1;
      }

      let userInfo;
      try {
        userInfo = await api.getUserInfo(uid);
      } catch (e) {
        return message.reply("❌ | Failed to fetch user information.");
      }

      let avatarUrl;
      try {
        avatarUrl = await usersData.getAvatarUrl(uid);
      } catch (e) {
        avatarUrl = null;
      }

      const uInfo = userInfo[uid] || {};
      
      let gender = "Unknown";
      let genderEmoji = "🤷‍♂️";
      
      if (uInfo.gender !== undefined) {
        const g = String(uInfo.gender).toLowerCase();
        if (g === "female" || g === "f" || g === "1") { 
          gender = "Female"; 
          genderEmoji = "🙋‍♀️";
        } else if (g === "male" || g === "m" || g === "2") { 
          gender = "Male"; 
          genderEmoji = "🙋‍♂️";
        }
      }

      const genderText = `${genderEmoji} 𝐆𝐞𝐧𝐝𝐞𝐫: ${gender}`;
      
      const vipList = global.GoatBot?.config?.vipuser || 
                      global.GoatBot?.config?.vipUser || 
                      global.GoatBot?.config?.vip || 
                      [];
      const isVip = Array.isArray(vipList) && vipList.includes(uid);
      const vipEmoji = isVip ? "✅ 𝐘𝐞𝐬" : "❌ 𝐍𝐨";
      
      let money = 0, exp = 0, level = 1, userData = {};
      try {
        userData = await usersData.get(uid) || {};
        money = userData.money || 0;
        exp = userData.exp || 0;
        level = userData.level || 1;
      } catch (e) {}
      
      let joinedDate = "N/A";
      try {
        const moment = require("moment");
        joinedDate = moment(userData.createdAt || Date.now()).format("DD/MM/YYYY");
      } catch (e) {
        joinedDate = "N/A";
      }
      
      let allUser = [], rank = "?", moneyRank = "?";
      try {
        allUser = await usersData.getAll();
        rank = allUser.sort((a, b) => (b.exp || 0) - (a.exp || 0)).findIndex(u => u.userID === uid) + 1;
        moneyRank = allUser.sort((a, b) => (b.money || 0) - (a.money || 0)).findIndex(u => u.userID === uid) + 1;
      } catch (e) {}
      
      const vanity = uInfo.vanity || "None";
      const isFriend = uInfo.isFriend ? "✅ 𝐘𝐞𝐬" : "❎ 𝐍𝐨";
      const isBirthday = uInfo.isBirthday ? "🎂 𝐓𝐨𝐝𝐚𝐲!" : "❌ 𝐍𝐨";
      
      let isAdmin = "N/A";
      if (event.threadID) {
        try {
          const threadInfo = await threadsData.get(event.threadID);
          if (threadInfo?.adminIDs) {
            isAdmin = threadInfo.adminIDs.includes(uid) ? "✅ 𝐘𝐞𝐬" : "❎ 𝐍𝐨";
          }
        } catch (e) {}
      }

      const userInformation = `
╭━〔 ✦ 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎 ✦ 〕━⬣
┃ 👤 𝐍𝐚𝐦𝐞: ${uInfo.name || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧"}
┃  ${genderText}
┃ 🆔 𝐔𝐈𝐃: ${uid}
┃ 🔖 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${vanity}
┃ 🎂 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐓𝐨𝐝𝐚𝐲: ${isBirthday}
┃ 👫 𝐅𝐫𝐢𝐞𝐧𝐝 𝐰𝐢𝐭𝐡 𝐛𝐨𝐭: ${isFriend}
┃ 👑 𝐕𝐈𝐏 𝐔𝐬𝐞𝐫?: ${vipEmoji}
┃ 📅 𝐉𝐨𝐢𝐧𝐞𝐝: ${joinedDate}
┣━〔 ✦ 𝐒𝐓𝐀𝐓𝐒 ✦ 〕━⬣
┃ 💰 𝐌𝐨𝐧𝐞𝐲: $${money.toLocaleString()}
┃ ⭐ 𝐄𝐗𝐏: ${exp.toLocaleString()}
┃ 🎯 𝐋𝐞𝐯𝐞𝐥: ${level}
┃ 🏆 𝐑𝐚𝐧𝐤: #${rank}/${allUser.length || "?"}
┃ 💵 𝐌𝐨𝐧𝐞𝐲 𝐑𝐚𝐧𝐤: #${moneyRank}/${allUser.length || "?"}
┣━〔 ✦ 𝐆𝐑𝐎𝐔𝐏 ✦ 〕━⬣
┃ 👑 𝐀𝐝𝐦𝐢𝐧 𝐡𝐞𝐫𝐞: ${isAdmin}
╰━━━━━━━━━━━━━━━━⬣`;

      let attachments = [];
      if (avatarUrl) {
        try {
          const stream = await global.utils.getStreamFromURL(avatarUrl);
          if (stream) attachments.push(stream);
        } catch (e) {}
      }

      await message.reply({
        body: userInformation,
        attachment: attachments.length > 0 ? attachments : undefined
      });

    } catch (error) {
      console.error("Spy command error:", error);
      return message.reply("❌ | An error occurred.");
    }
  },
};
