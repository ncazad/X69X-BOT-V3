const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "0.0.7",
    author: "Azadx69x",
    category: "owner",
    guide: { en: "view owner info." },
    usePrefix: true
  },

  sentThreads: new Map(),

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadID;

    if (this.sentThreads.has(threadID)) return;
    this.sentThreads.set(threadID, true);

    const ownerInfo = {
      name: "𝐦𝐨𝐡𝐚𝐦𝐦𝐚𝐝 𝐚𝐳𝐚𝐝",
      nick: "𝐚𝐳𝐚𝐝𝐱𝟔𝟗𝐱",
      age: "𝟏𝟖",
      gender: "𝐌𝐚𝐥𝐞",
      from: "𝐁𝐡𝐨𝐥𝐚,𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡",
      religion: "𝐈𝐬𝐥𝐚𝐦",
      status: "𝐒𝐢𝐧𝐠𝐥𝐞",
      dream: "😛 𝐛𝐨𝐮",
      hobby: "𝐆𝐚𝐦𝐢𝐧𝐠,𝐜𝐨𝐝𝐢𝐧𝐠",
    };

    const msg = `╔═════ ∘◦ ☆ ◦∘ ═════╗
    🎀  𝐎𝐖𝐍𝐄𝐑  𝐈𝐍𝐅𝐎  🎀
 ━━━━━━━━━━━━━━━━━━
  🏷️ 𝐍𝐚𝐦𝐞 : ${ownerInfo.name}
  🏷️ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 : ${ownerInfo.nick}
  🎂 𝐀𝐠𝐞 : ${ownerInfo.age}
  ⚧️ 𝐆𝐞𝐧𝐝𝐞𝐫 : ${ownerInfo.gender}
  🌍 𝐅𝐫𝐨𝐦 : ${ownerInfo.from}
  🕋 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧 : ${ownerInfo.religion}
  ❤️ 𝐒𝐭𝐚𝐭𝐮𝐬 : ${ownerInfo.status}
  😶 𝐃𝐫𝐞𝐚𝐦 : ${ownerInfo.dream}
  🎯 𝐇𝐨𝐛𝐛𝐲 : ${ownerInfo.hobby}
 ━━━━━━━━━━━━━━━━━━
  💫 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐰𝐚𝐭𝐜𝐡𝐢𝐧𝐠
  📝 𝐀𝐧𝐲 𝐩𝐫𝐨𝐛𝐥𝐞𝐦? 𝐓𝐚𝐥𝐤 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧.
╚═════ ∘◦ ☆ ◦∘ ═════╝`;

    try {
      await message.reply(msg);
    } catch (e) {
      console.error("chudling pong:", e);
      await message.reply("❌ 𝐄𝐫𝐫𝐨𝐫 𝐬𝐞𝐧𝐝𝐢𝐧𝐠 𝐨𝐰𝐧𝐞𝐫 𝐢𝐧𝐟𝐨.");
    }

    setTimeout(() => this.sentThreads.delete(threadID), 300000);
  }
};
