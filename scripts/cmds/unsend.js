module.exports = {
  config: {
    name: "unsend",
    aliases: ["u", "r", "uns"],
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: {
      en: "Delete bot messages"
    },
    category: "box chat",
    guide: {
      en: "Reply to a bot's message and type unsend"
    },
    usePrefix: false
  },
  
  errors: ["🐸 𝐂𝐡𝐮𝐝𝐥𝐢𝐧𝐠 𝐩𝐨𝐧𝐠 𝐁𝐚𝐛𝐲 🫶"],

  async handleUnsend({ event, message, api }) {
    const botID = api.getCurrentUserID();

    if (!event.messageReply || !event.messageReply.messageID) {
      const randomError = this.errors[Math.floor(Math.random() * this.errors.length)];
      return message.reply(randomError);
    }

    if (event.messageReply.senderID !== botID) {
      const randomError = this.errors[Math.floor(Math.random() * this.errors.length)];
      return message.reply(randomError);
    }

    try {
      await message.unsend(event.messageReply.messageID);
    } catch (e) {
      return message.reply("⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐮𝐧𝐬𝐞𝐧𝐝 𝐦𝐞𝐬𝐬𝐚𝐠𝐞.");
    }
  },

  onStart: async function (ctx) {
    return this.handleUnsend(ctx);
  },

  onChat: async function ({ event, message, api }) {
    if (!event.isGroup) return;

    const body = event.body?.toLowerCase()?.trim();
    if (!body) return;

    if (["u", "r", "uns"].includes(body)) {
      return this.handleUnsend({ event, message, api });
    }
  }
};
