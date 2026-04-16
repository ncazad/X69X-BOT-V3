const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "leave",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 2,
    shortDescription: "Leave group chats",
    longDescription: "List all group chats with pagination and leave selected groups",
    category: "admin",
    guide: {
      en: "{p}{n} - List groups\nReply with number to leave\nReply 'next'/'previous' for pagination",
    },
  },

  onStart: async function ({ api, event, message }) {
    try {
      const groupList = await api.getThreadList(300, null, ['INBOX']); 
      const filteredList = groupList.filter(group => group.threadName !== null);

      if (filteredList.length === 0) {
        return message.reply('❌ 𝐍𝐨 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬 𝐟𝐨𝐮𝐧𝐝.');
      }

      const formatGroups = (list, start=0) =>
        list.slice(start, start+5).map((g,i) => {
          let groupName = g.threadName;
          if (groupName.length > 25) groupName = groupName.slice(0,22) + "...";
          return `│ ${start+i+1}. 𝐆𝐫𝐨𝐮𝐩: ${groupName}\n│ 🆔 𝐓𝐈𝐃: ${g.threadID}`;
        });

      const start = 0;
      const currentList = formatGroups(filteredList, start);
      const totalPages = Math.ceil(filteredList.length / 5);

      const message_text = `╭━━━━━━━━━━━━━━━━━╮
│   🚪 𝐋𝐄𝐀𝐕𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃   │
├━━━━━━━━━━━━━━━━━┤
${currentList.join("\n")}
├━━━━━━━━━━━━━━━━━┤
│ 📄 𝐏𝐚𝐠𝐞 1/${totalPages}
│ 💡 𝐑𝐞𝐩𝐥𝐲: 𝐧𝐮𝐦𝐛𝐞𝐫
╰━━━━━━━━━━━━━━━━━╯`;

      const sentMessage = await message.reply(message_text);

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: 'leave',
        messageID: sentMessage.messageID,
        author: event.senderID,
        start,
        filteredList,
        totalPages
      });

    } catch (error) {
      console.error("Error listing group chats:", error);
      message.reply('❌ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐥𝐢𝐬𝐭𝐢𝐧𝐠 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬.');
    }
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const { author, start, filteredList, totalPages } = Reply;

    if (event.senderID !== author) {
      return message.reply('⚠️ 𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐚𝐮𝐭𝐡𝐨𝐫 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐫𝐞𝐩𝐥𝐲.');
    }

    const userInput = args.join(" ").trim().toLowerCase();

    const formatGroups = (list, start=0) =>
      list.slice(start, start+5).map((g,i) => {
        let groupName = g.threadName;
        if (groupName.length > 25) groupName = groupName.slice(0,22) + "...";
        return `│ ${start+i+1}. 𝐆𝐫𝐨𝐮𝐩: ${groupName}\n│ 🆔 𝐓𝐈𝐃: ${g.threadID}`;
      });
    
    if (userInput === 'next') {
      const nextStart = start + 5;
      if (nextStart >= filteredList.length) return message.reply('⚠️ 𝐄𝐧𝐝 𝐨𝐟 𝐥𝐢𝐬𝐭 𝐫𝐞𝐚𝐜𝐡𝐞𝐝.');

      const currentList = formatGroups(filteredList, nextStart);
      const currentPage = Math.floor(nextStart/5)+1;

      const message_text = `╭━━━━━━━━━━━━━━━━━╮
│   🚪 𝐋𝐄𝐀𝐕𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃   │
├━━━━━━━━━━━━━━━━━┤
${currentList.join("\n")}
├━━━━━━━━━━━━━━━━━┤
│ 📄 𝐏𝐚𝐠𝐞 ${currentPage}/${totalPages}
│ 💡 𝐑𝐞𝐩𝐥𝐲: 𝐧𝐮𝐦𝐛𝐞𝐫
╰━━━━━━━━━━━━━━━━━╯`;

      const sentMessage = await message.reply(message_text);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: 'leave',
        messageID: sentMessage.messageID,
        author: event.senderID,
        start: nextStart,
        filteredList,
        totalPages
      });

      return;
    }
    
    if (userInput === 'previous') {
      const prevStart = Math.max(start - 5, 0);
      if (prevStart === start) return message.reply('⚠️ 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐭 𝐭𝐡𝐞 𝐛𝐞𝐠𝐢𝐧𝐧𝐢𝐧𝐠.');

      const currentList = formatGroups(filteredList, prevStart);
      const currentPage = Math.floor(prevStart/5)+1;

      const message_text = `╭━━━━━━━━━━━━━━━━━╮
│   🚪 𝐋𝐄𝐀𝐕𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃   │
├━━━━━━━━━━━━━━━━━┤
${currentList.join("\n")}
├━━━━━━━━━━━━━━━━━┤
│ 📄 𝐏𝐚𝐠𝐞 ${currentPage}/${totalPages}
│ 💡 𝐑𝐞𝐩𝐥𝐲: 𝐧𝐮𝐦𝐛𝐞𝐫
╰━━━━━━━━━━━━━━━━━╯`;

      const sentMessage = await message.reply(message_text);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: 'leave',
        messageID: sentMessage.messageID,
        author: event.senderID,
        start: prevStart,
        filteredList,
        totalPages
      });

      return;
    }
    
    if (!isNaN(userInput)) {
      const idx = parseInt(userInput,10);
      if (idx <= 0 || idx > filteredList.length) return message.reply(`❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐠𝐫𝐨𝐮𝐩 𝐧𝐮𝐦𝐛𝐞𝐫. 𝐂𝐡𝐨𝐨𝐬𝐞 1-${filteredList.length}`);

      const group = filteredList[idx-1];
      try {
        const botId = api.getCurrentUserID();
        await api.removeUserFromGroup(botId, group.threadID);

        return message.reply(`✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐥𝐞𝐟𝐭:
📛 ${group.threadName.length>25 ? group.threadName.slice(0,22)+"..." : group.threadName}
🆔 ${group.threadID}`);
      } catch (err) {
        console.error(err);
        return message.reply('❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐞𝐚𝐯𝐞 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.');
      }
    }

    message.reply(`❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐢𝐧𝐩𝐮𝐭.
💡 𝐔𝐬𝐞:
• 𝐍𝐮𝐦𝐛𝐞𝐫 1-${filteredList.length} 𝐭𝐨 𝐥𝐞𝐚𝐯𝐞
• "next" 𝐟𝐨𝐫 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞
• "previous" 𝐟𝐨𝐫 𝐩𝐫𝐞𝐯𝐢𝐨𝐮𝐬`);
  },
};
