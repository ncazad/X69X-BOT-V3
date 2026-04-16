const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Prefix manager",
    longDescription: "Control bot prefix (chat/global)",
    category: "system"
  },

  langs: {
    en: {
      askPrefix: "😏 𝙃𝙚𝙮 %name%, 𝙙𝙞𝙙 𝙮𝙤𝙪 𝙖𝙨𝙠 𝙛𝙤𝙧 𝙢𝙮 𝙥𝙧𝙚𝙛𝙞𝙭?\n╭─❯🌐 𝙂𝙡𝙤𝙗𝙖𝙡 ⟿『%global%』\n╰─❯💬 𝘾𝙝𝙖𝙩 ⟿ 『%chat%』\n\n🤖 𝙄'𝙢 𝙓69𝙓 𝘽𝙊𝙏 𝙑3 𝙖𝙩 𝙮𝙤𝙪𝙧 𝙨𝙚𝙧𝙫𝙞𝙘𝙚 👿",
      resetPrefix: "☢️ 𝙋𝙧𝙚𝙛𝙞𝙭 𝙍𝙚𝙨𝙚𝙩\n\n🌐 𝙂𝙡𝙤𝙗𝙖𝙡 ⟿ %global%\n💬 𝘾𝙝𝙖𝙩 ⟿ %global%\n\n🤖 𝙓69𝙓 𝘽𝙊𝙏 𝙑3",
      confirmChange: "♻️ %type% 𝘾𝙝𝙖𝙣𝙜𝙚\n%old% ⇢ %new%\n\n👆 𝙍𝙚𝙖𝙘𝙩 𝙬𝙞𝙩𝙝 ✅ 𝙩𝙤 𝙘𝙤𝙣𝙛𝙞𝙧𝙢",
      updatedGlobal: "✅ 𝙂𝙡𝙤𝙗𝙖𝙡 𝙐𝙥𝙙𝙖𝙩𝙚 ⇢ %prefix%\n\n🤖 𝙓69𝙓 𝘽𝙊𝙏 𝙑3",
      updatedChat: "✅ 𝘾𝙝𝙖𝙩 𝙐𝙥𝙙𝙖𝙩𝙚 ⇢ %prefix%\n\n🤖 𝙓69𝙓 𝘽𝙊𝙏 𝙑3",
      ownerOnly: "⛔ 𝙊𝙬𝙣𝙚𝙧 𝙊𝙣𝙡𝙮",
      cancelled: "❌ 𝘾𝙖𝙣𝙘𝙚𝙡𝙡𝙚𝙙"
    }
  },

  onStart: async function ({ api, event, args, threadsData, getLang }) {
    const { threadID, messageID, senderID } = event;

    let name = "User";
    try {
      const data = await api.getUserInfo(senderID);
      name = data[senderID]?.name?.split(" ")[0] || "User";
    } catch {}

    const globalPf = global.GoatBot.config.prefix;
    const threadPf = await threadsData.get(threadID, "data.prefix").catch(() => null);
    const currentPf = threadPf || globalPf;

    if (!args[0]) {
      return api.sendMessage(
        getLang("askPrefix").replace("%name%", name).replace("%global%", globalPf).replace("%chat%", currentPf),
        threadID,
        messageID
      );
    }

    if (args[0].toLowerCase() === "reset") {
      await threadsData.set(threadID, null, "data.prefix");
      return api.sendMessage(
        getLang("resetPrefix").replace(/%global%/g, globalPf),
        threadID,
        messageID
      );
    }

    const nextPf = args[0];
    const isGlobal = args[1] === "-g";

    if (isGlobal && senderID !== api.getCurrentUserID()) {
      return api.sendMessage(getLang("ownerOnly"), threadID, messageID);
    }

    const confirmText = isGlobal
      ? getLang("confirmChange").replace("%type%", "Global").replace("%old%", globalPf).replace("%new%", nextPf)
      : getLang("confirmChange").replace("%type%", "Chat").replace("%old%", currentPf).replace("%new%", nextPf);

    return api.sendMessage(confirmText, threadID, (err, info) => {
      if (err) return;
      
      global.GoatBot.onReaction.set(info.messageID, {
        messageID: info.messageID,
        commandName: "prefix",
        uid: senderID,
        prefix: nextPf,
        isGlobal: isGlobal,
        threadID: threadID
      });
    }, messageID);
  },

  onReaction: async function ({ api, event, Reaction, threadsData, getLang }) {
    const { userID, messageID, reaction, threadID } = event;
    
    if (!Reaction || Reaction.uid !== userID) return;
    
    const normalizedReaction = reaction ? reaction.toString().replace(/\uFE0F/g, '').trim() : '';
    const targetEmoji = "✅";
    
    const isConfirm = normalizedReaction === targetEmoji || 
                      normalizedReaction === "✓" || 
                      normalizedReaction === "☑" ||
                      normalizedReaction === "✔";
    
    if (!isConfirm) {
      global.GoatBot.onReaction.delete(messageID);
      return api.sendMessage(getLang("cancelled"), Reaction.threadID, messageID);
    }

    const { prefix, isGlobal } = Reaction;
    
    global.GoatBot.onReaction.delete(messageID);

    if (isGlobal) {
      global.GoatBot.config.prefix = prefix;
      await fs.writeFile(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return api.sendMessage(getLang("updatedGlobal").replace("%prefix%", prefix), threadID);
    }

    await threadsData.set(threadID, prefix, "data.prefix");
    return api.sendMessage(getLang("updatedChat").replace("%prefix%", prefix), threadID);
  }
};
