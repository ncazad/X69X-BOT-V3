module.exports = {
  config: {
    name: "supportgc",
    aliases: ["support", "gc"],
    version: "0.0.8",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Add user to support group",
    },
    longDescription: {
      en: "Adds the user to the admin support group, notifies everyone, and uses fancy.",
    },
    category: "group",
    guide: {
      en: "Type )supportgc to join the support group",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const supportGroupId = "1229038958739377";
      const commandThreadID = event.threadID; 
      const userID = event.senderID;
      
      const userInfo = await api.getUserInfo(userID);
      const userName = userInfo[userID].name;
      
      const threadInfo = await api.getThreadInfo(supportGroupId);
      const participantIDs = threadInfo.participantIDs;

      if (participantIDs.includes(userID)) {
        return api.sendMessage(
          `
╭─❖
│ 💌 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐆𝐑𝐎𝐔𝐏
├─•
│ 🤖 𝐍ᴏᴛɪᴄᴇ: 𝐔sᴇʀ 𝐀ʟʀᴇᴀᴅʏ 𝐀ᴅᴅᴇᴅ!
│ 👤 𝐍𝐚𝐦𝐞: ${userName}
│ 📩 𝐂ʜᴇᴄᴋ 𝐬ᴘᴀᴍ 𝐨ʀ 𝐦𝐞ssage requests
╰─❖
          `,
          commandThreadID
        );
      }
      
      api.addUserToGroup(userID, supportGroupId, (err) => {
        if (err) {
          return api.sendMessage(
            `
╭─❖
│ ⚠️ 𝐀ᴅᴍɪɴ 𝐒ᴜᴘᴘᴏʀᴛ 𝐆𝐑𝐎𝐔𝐏
├─•
│ ❌ 𝐄ʀʀᴏʀ: Unable to add user
│ 👤 𝐍𝐚𝐦𝐞: ${userName}
│ 🆔 𝐔sᴇʀ ID: ${userID}
│ ❗ Account might be private or message requests blocked
╰─❖
            `,
            commandThreadID
          );
        }
        
        api.sendMessage(
          `
╭─❖
│ ✅ 𝐀ᴅᴅ 𝐒ᴜᴄᴄᴇss
├─•
│ 👤 𝐍𝐚𝐦𝐞: ${userName}
│ 🆔 𝐔sᴇʀ ID: ${userID}
│ 🎉 𝐍ᴏᴡ 𝐀ᴅᴅᴇᴅ 𝐒ᴜᴄᴄᴇssғᴜʟ 𝐒ᴜᴘᴘᴏʀᴛ 𝐆𝐫𝐨ᴜᴘ!
╰─❖
          `,
          commandThreadID
        );
        
        const notificationMessage = `
╭─❖
│ 💌 𝐀ᴅᴍɪɴ 𝐒ᴜᴘᴘᴏʀᴛ 𝐆𝐑𝐎𝐔𝐏
├─•
│ 👤 𝐍ᴇᴡ 𝐔sᴇʀ 𝐀ᴅᴅᴇᴅ
│ 👤 𝐍𝐚𝐦𝐞: ${userName}
│ 🆔 𝐔sᴇʀ ID: ${userID}
│ ✅ 𝐂ʜᴇᴄᴋ 𝐢ɴ 𝐒ᴜᴘᴘᴏʀᴛ 𝐆𝐫𝐨ᴜᴘ
╰─❖
`;
        
        api.sendMessage(notificationMessage, supportGroupId);
      });
    } catch (err) {
      console.error("[SUPPORTGC CMD ERROR]", err);
      api.sendMessage(
        `
╭─❖
│ ❌ 𝐄ʀʀᴏʀ
├─•
│ Failed to process support group add
╰─❖
        `,
        event.threadID,
        event.messageID
      );
    }
  },
};
