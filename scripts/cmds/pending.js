module.exports = {
  config: {
    name: "pending",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "Quản lý nhóm đang chờ phê duyệt",
      en: "Manage pending group approvals"
    },
    longDescription: {
      vi: "Lệnh quản trị để xem, chấp nhận hoặc từ chối các nhóm đang chờ tham gia bot\n\nCách sử dụng:\n• /pending - Hiển thị danh sách nhóm chờ\n• Trả lời với số - Chấp nhận nhóm\n• Trả lời với 'c' + số - Từ chối nhóm",
      en: "Admin command to view, approve or reject groups waiting to add the bot\n\nUsage:\n• /pending - Show pending groups list\n• Reply with numbers - Approve groups\n• Reply with 'c' + numbers - Cancel/reject groups"
    },
    category: "Admin",
    guide: {
      vi: {
        body: "{pn}: Xem danh sách nhóm đang chờ\n{pn} [số | c/số]: Phê duyệt/từ chối nhóm"
      },
      en: {
        body: "{pn}: View pending groups list\n{pn} [number | c/number]: Approve/reject groups"
      }
    }
  },

  langs: {
    en: {
      invaildNumber: "❌ %1 𝗶𝘀 𝗻𝗼𝘁 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗯𝗲𝗿",
      cancelSuccess: "✅ 𝗥𝗲𝗳𝘂𝘀𝗲𝗱 %1 𝘁𝗵𝗿𝗲𝗮𝗱(𝘀)!",
      approveSuccess: "✅ 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 %1 𝘁𝗵𝗿𝗲𝗮𝗱(𝘀)!",
      cantGetPendingList: "❌ 𝗖𝗮𝗻'𝘁 𝗴𝗲𝘁 𝘁𝗵𝗲 𝗽𝗲𝗻𝗱𝗶𝗻𝗴 𝗹𝗶𝘀𝘁!",
      returnListPending: "📋 »「𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗟𝗜𝗦𝗧」«\n┣✦ 𝗧𝗼𝘁𝗮𝗹 𝘁𝗵𝗿𝗲𝗮𝗱𝘀: %1\n┣✦ 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝘁𝗼 𝗮𝗽𝗽𝗿𝗼𝘃𝗲\n┣✦ 𝗨𝘀𝗲 '𝗰' 𝗯𝗲𝗳𝗼𝗿𝗲 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝘁𝗼 𝗰𝗮𝗻𝗰𝗲𝗹\n┗✦ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 𝟭 𝟮 𝟯 𝗼𝗿 𝗰𝟭 𝗰𝟮\n\n%2",
      returnListClean: "📭「𝗣𝗘𝗡𝗗𝗜𝗡𝗚」𝗧𝗵𝗲𝗿𝗲 𝗮𝗿𝗲 𝗻𝗼 𝗽𝗲𝗻𝗱𝗶𝗻𝗴 𝗴𝗿𝗼𝘂𝗽𝘀 𝗮𝘁 𝘁𝗵𝗲 𝗺𝗼𝗺𝗲𝗻𝘁",
      syntaxError: "⚠️ 𝗦𝘆𝗻𝘁𝗮𝘅 𝗲𝗿𝗿𝗼𝗿! 𝗣𝗹𝗲𝗮𝘀𝗲 𝘂𝘀𝗲:\n• 𝗡𝘂𝗺𝗯𝗲𝗿𝘀 𝘁𝗼 𝗮𝗽𝗽𝗿𝗼𝘃𝗲 (𝟭 𝟮 𝟯)\n• '𝗰' + 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝘁𝗼 𝗰𝗮𝗻𝗰𝗲𝗹 (𝗰𝟭 𝗰𝟮)",
      noPermission: "🚫 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗽𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝘁𝗼 𝘂𝘀𝗲 𝘁𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱!"
    },
    vi: {
      invaildNumber: "❌ %1 𝗸𝗵ô𝗻𝗴 𝗽𝗵ả𝗶 𝗹à 𝘀ố 𝗵ợ𝗽 𝗹ệ",
      cancelSuccess: "✅ Đã 𝘁ừ 𝗰𝗵ố𝗶 %1 𝗻𝗵ó𝗺!",
      approveSuccess: "✅ Đã 𝗽𝗵ê 𝗱𝘂𝘆ệ𝘁 𝘁𝗵à𝗻𝗵 𝗰ô𝗻𝗴 %1 𝗻𝗵ó𝗺!",
      cantGetPendingList: "❌ 𝗞𝗵ô𝗻𝗴 𝘁𝗵ể 𝗹ấ𝘆 𝗱𝗮𝗻𝗵 𝘀á𝗰𝗵 𝗰𝗵ờ!",
      returnListPending: "📋 »「𝗗𝗔𝗡𝗛 𝗦Á𝗖𝗛 𝗖𝗛Ờ」«\n┣✦ 𝗧ổ𝗻𝗴 𝘀ố 𝗻𝗵ó𝗺: %1\n┣✦ 𝗣𝗵ả𝗻 𝗵ồ𝗶 𝗯ằ𝗻𝗴 𝘀ố để 𝗰𝗵ấ𝗽 𝗻𝗵ậ𝗻\n┣✦ 𝗗ù𝗻𝗴 '𝗰' 𝘁𝗿ướ𝗰 𝘀ố để 𝘁ừ 𝗰𝗵ố𝗶\n┗✦ 𝗩í 𝗱ụ: 𝟭 𝟮 𝟯 𝗵𝗼ặ𝗰 𝗰𝟭 𝗰𝟮\n\n%2",
      returnListClean: "📭「𝗗𝗔𝗡𝗛 𝗦Á𝗖𝗛 𝗖𝗛Ờ」𝗛𝗶ệ𝗻 𝗸𝗵ô𝗻𝗴 𝗰ó 𝗻𝗵ó𝗺 𝗻à𝗼 đ𝗮𝗻𝗴 𝗰𝗵ờ",
      syntaxError: "⚠️ 𝗟ỗ𝗶 𝗰ú 𝗽𝗵á𝗽! 𝗩𝘂𝗶 𝗹ò𝗻𝗴 𝗱ù𝗻𝗴:\n• 𝗦ố để 𝗰𝗵ấ𝗽 𝗻𝗵ậ𝗻 (𝟭 𝟮 𝟯)\n• '𝗰' + 𝘀ố để 𝘁ừ 𝗰𝗵ố𝗶 (𝗰𝟭 𝗰𝟮)",
      noPermission: "🚫 𝗕ạ𝗻 𝗸𝗵ô𝗻𝗴 𝗰ó 𝗾𝘂𝘆ề𝗻 𝘀ử 𝗱ụ𝗻𝗴 𝗹ệ𝗻𝗵 𝗻à𝘆!"
    }
  },

  onReply: async function ({ api, event, Reply, getLang, commandName }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    if (body.toLowerCase() === "help" || body === "?") {
      return api.sendMessage(getLang("syntaxError"), threadID, messageID);
    }
    
    if ((isNaN(body) && body.toLowerCase().startsWith("c")) || body.toLowerCase().startsWith("cancel")) {
      let indexStr = body.toLowerCase().replace("cancel", "").replace("c", "").trim();
      if (!indexStr) return api.sendMessage(getLang("syntaxError"), threadID, messageID);

      const index = indexStr.split(/\s+/);
      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length)
          return api.sendMessage(getLang("invaildNumber", i), threadID, messageID);
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[i - 1].threadID);
          count++;
        } catch (e) {
          console.error("Error removing from group:", e);
        }
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    } else {
      const index = body.split(/\s+/);
      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length)
          return api.sendMessage(getLang("invaildNumber", i), threadID, messageID);

        const targetThread = Reply.pending[i - 1].threadID;
        try {
          const threadInfo = await api.getThreadInfo(targetThread);
          const groupName = threadInfo.threadName || "Unnamed Group";
          const memberCount = threadInfo.participantIDs ? threadInfo.participantIDs.length : 0;
          const time = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });
          
          await api.sendMessage(
`╔═════✦❖༺❖✦════╗
┃
┃➥📁 𝗚𝗥𝗢𝗨𝗣 𝗡𝗔𝗠𝗘: ${groupName}
┃➥👥 𝗠𝗘𝗠𝗕𝗘𝗥𝗦: ${memberCount}
┃➥⚡ 𝗔𝗣𝗣𝗥𝗢𝗩𝗔𝗟 𝗠𝗢𝗗𝗘: ${threadInfo.approvalMode ? "𝗢𝗡" : "𝗢𝗙𝗙"}
┃➥😀 𝗘𝗠𝗢𝗝𝗜: ${threadInfo.emoji || "𝗡𝗢𝗡𝗘"}
┃➥🕐 𝗝𝗢𝗜𝗡𝗘𝗗: ${time}
┃➥🤖 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥:『𝘼𝙯𝙖𝙙𝙭𝟲𝟵𝙭』
╚═════✦❖༺❖✦════╝

💡 𝗧𝘆𝗽𝗲 /𝗵𝗲𝗹𝗽 𝘁𝗼 𝘀𝗲𝗲 𝗮𝗹𝗹 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀
✅ 𝗕𝗼𝘁 𝗶𝘀 𝗻𝗼𝘄 𝗮𝗰𝘁𝗶𝘃𝗲 𝗶𝗻 𝘁𝗵𝗶𝘀 𝗴𝗿𝗼𝘂𝗽!`, targetThread);

          count++;
        } catch (error) {
          console.error("Error approving group:", error);
        }
      }
      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID, senderID } = event;
    
    const botID = api.getCurrentUserID();
    if (senderID !== botID) {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const isAdmin = threadInfo.adminIDs && threadInfo.adminIDs.some(admin => admin.id === senderID);
        if (!isAdmin) {
          return api.sendMessage(getLang("noPermission"), threadID, messageID);
        }
      } catch (e) {
        console.error("Error checking admin:", e);
        return api.sendMessage(getLang("noPermission"), threadID, messageID);
      }
    }

    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

      if (list.length === 0) {
        return api.sendMessage(getLang("returnListClean"), threadID, messageID);
      }

      for (const item of list) {
        const groupName = item.name || "Unnamed Group";
        msg += `┣ ${index++}. ${groupName}\n   ┗ 𝗜𝗗: ${item.threadID}\n`;
      }

      const responseMsg = getLang("returnListPending", list.length, msg);
      return api.sendMessage(responseMsg, threadID, (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });
      }, messageID);

    } catch (e) {
      console.error("Error pending command:", e);
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};
