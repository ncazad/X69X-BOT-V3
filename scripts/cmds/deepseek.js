const axios = require("axios");

const API_BASE = "https://azadx69x.is-a.dev";

async function fetchAI(query, retries = 2) {
  try {
    return await axios.get(
      `${API_BASE}/api/deepseek?query=${encodeURIComponent(query)}`,
      { timeout: 60000 }
    );
  } catch (err) {
    if (retries > 0) return fetchAI(query, retries - 1);
    throw err;
  }
}

function buildMessage(query, answer) {
  return `🤖 | 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸 𝗔𝗜

🧠 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻:
${query}

💬 𝗔𝗻𝘀𝘄𝗲𝗿:
${answer}

━━━━━━━━━━━━━━`;
}

module.exports = {
  config: {
    name:        "deepseek",
    aliases:     ["ai"],
    version:     "0.0.7",
    author:      "Azadx69x",
    role:        0,
    countDown:   3,
    description: "Chat with DeepSeek AI",
    category:    "ai",
    guide:       "{pn} <question>"
  },

  onStart: async function ({ message, args, event }) {
    let query = args.join(" ").trim();

    if (!query && event.type === "message_reply" && event.messageReply) {
      query = event.messageReply.body || "";
    }

    if (!query) {
      return message.reply("❌ Please ask something!");
    }

    try {
      const res = await fetchAI(query);
      const answer = res.data?.response || res.data?.answer || res.data?.message || "⚠️ AI is not responding right now.";
      const text   = buildMessage(query, answer);
      const chunks = text.match(/[\s\S]{1,1800}/g) || [text];

      let lastMsgID = null;
      for (const chunk of chunks) {
        const sent = await message.reply(chunk);
        if (sent?.messageID) lastMsgID = sent.messageID;
      }

      if (lastMsgID) {
        global.GoatBot.onReply.set(lastMsgID, {
          commandName: "deepseek",
          messageID:   lastMsgID,
          author:      event.senderID
        });
      }

    } catch (err) {
      return message.reply(`❌ AI Error\n\n💡 ${err.response?.data?.error || err.message}`);
    }
  },

  onReply: async function ({ message, event, Reply }) {
    if (!Reply || Reply.commandName !== "deepseek") return;
    if (Reply.author && event.senderID !== Reply.author) return;

    const query = (event.body || "").trim();
    if (!query) return message.reply("❌ Please write something!");

    global.GoatBot.onReply.delete(Reply.messageID);

    try {
      const res = await fetchAI(query);
      const answer = res.data?.response || res.data?.answer || res.data?.message || "⚠️ AI is not responding right now.";
      const text   = buildMessage(query, answer);
      const chunks = text.match(/[\s\S]{1,1800}/g) || [text];

      let lastMsgID = null;
      for (const chunk of chunks) {
        const sent = await message.reply(chunk);
        if (sent?.messageID) lastMsgID = sent.messageID;
      }

      if (lastMsgID) {
        global.GoatBot.onReply.set(lastMsgID, {
          commandName: "deepseek",
          messageID:   lastMsgID,
          author:      event.senderID
        });
      }

    } catch (err) {
      return message.reply(`❌ AI Error\n\n💡 ${err.response?.data?.error || err.message}`);
    }
  }
};
