const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const axios = require("axios");

function fancyText(text) {
  return global.utils?.toGlobalFontStyle ? global.utils.toGlobalFontStyle(text) : text;
}

module.exports = {
  config: {
    name: "vip",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 2,
    description: { en: "Add, remove, list VIP users" },
    category: "box chat",
    guide: { en: "{pn} [add/remove/list]" }
  },

  langs: {
    en: {
      missingIdAdd: fancyText("⚠️ | Reply / tag / UID required to add VIP"),
      missingIdRemove: fancyText("⚠️ | Reply / tag / UID required to remove VIP")
    }
  },

  onStart: async function ({ message, args, usersData, event, api }) {
    let vipArray = config.vipuser || config.vipUser || config.vip || [];

    vipArray = vipArray.filter(uid => uid && String(uid).trim() !== "" && !isNaN(uid));

    const getUserInfo = async (uid) => {
      try {
        try {
          const name = await usersData.getName(uid);
          if (name && name !== "Unknown User" && name !== "null")
            return { uid, name };
        } catch {}

        try {
          const info = await api.getUserInfo(uid);
          if (info && info[uid])
            return { uid, name: info[uid].name || "Unknown User" };
        } catch {}

        try {
          const r = await axios.get(`https://graph.facebook.com/${uid}?fields=name&access_token=EAABwzLixnjYBO`);
          if (r.data && r.data.name)
            return { uid, name: r.data.name };
        } catch {}

        try {
          const r = await axios.get(`https://facebook.com/${uid}`, {
            headers: { "User-Agent": "Mozilla/5.0" }
          });
          const match = r.data.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (match && match[1]) {
            let name = match[1].replace("| Facebook", "").trim();
            if (name.length > 1) return { uid, name };
          }
        } catch {}

        return { uid, name: `User_${String(uid).slice(0, 8)}` };
      } catch {
        return { uid, name: `User_${String(uid).slice(0, 8)}` };
      }
    };

    const getUIDs = () => {
      let uids = [];

      if (event.mentions && Object.keys(event.mentions).length > 0)
        uids = Object.keys(event.mentions);

      else if (event.messageReply?.senderID)
        uids.push(event.messageReply.senderID);

      else if (args.length > 1)
        uids = args.slice(1).filter(id => !isNaN(id));

      else if (args[0] === "add" && args.length === 1)
        uids.push(event.senderID);

      return [...new Set(uids.map(id => id.toString().trim()))];
    };

    const sub = (args[0] || "").toLowerCase();

    if (sub === "list" || sub === "-l") {
      if (!vipArray.length)
        return message.reply(fancyText("⚠️ | No VIP users found"));

      const info = await Promise.all(vipArray.map(uid => getUserInfo(uid)));
      const list = info.map((u, i) => `${i + 1}. ${u.name} (${u.uid})`).join("\n");

      return message.reply(fancyText(`👨‍💻 VIP Users:\n${list}`));
    }

    if (sub === "add" || sub === "-a") {
      const uids = getUIDs();
      if (!uids.length)
        return message.reply(this.langs.en.missingIdAdd);

      const added = [], already = [];

      let newArray = [...vipArray];

      for (const uid of uids) {
        if (newArray.includes(uid)) already.push(uid);
        else {
          newArray.push(uid);
          added.push(uid);
        }
      }

      if (added.length > 0) {
        config.vipuser = newArray;
        this.saveConfig();

        const info = await Promise.all(added.map(uid => getUserInfo(uid)));
        await message.reply(fancyText(
          `✅ Added VIP role for ${added.length} user(s):\n` +
          info.map(u => `• ${u.name} (${u.uid})`).join("\n")
        ));
      }

      if (already.length > 0) {
        const info = await Promise.all(already.map(uid => getUserInfo(uid)));
        return message.reply(fancyText(
          `⚠️ Already VIPs:\n` +
          info.map(u => `• ${u.name} (${u.uid})`).join("\n")
        ));
      }

      return;
    }

    if (sub === "remove" || sub === "-r") {
      const uids = getUIDs();
      if (!uids.length)
        return message.reply(this.langs.en.missingIdRemove);

      const removed = [], notVip = [];

      let newArray = [...vipArray];

      for (const uid of uids) {
        const index = newArray.indexOf(uid);
        if (index !== -1) {
          newArray.splice(index, 1);
          removed.push(uid);
        } else notVip.push(uid);
      }

      if (removed.length > 0) {
        config.vipuser = newArray;
        this.saveConfig();

        const info = await Promise.all(removed.map(uid => getUserInfo(uid)));
        await message.reply(fancyText(
          `✅ Removed VIP role for ${removed.length} user(s):\n` +
          info.map(u => `• ${u.name} (${u.uid})`).join("\n")
        ));
      }

      if (notVip.length > 0) {
        const info = await Promise.all(notVip.map(uid => getUserInfo(uid)));
        return message.reply(fancyText(
          `⚠️ Not VIP:\n` +
          info.map(u => `• ${u.name} (${u.uid})`).join("\n")
        ));
      }

      return;
    }

    return message.reply(fancyText("❌ Invalid command"));
  },

  saveConfig: function () {
    try {
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
      console.log(fancyText("✅ VIP Config saved"));
    } catch (err) {
      console.error("❌ Error saving VIP config:", err);
    }
  }
};
