const axios = require("axios");

module.exports = {
    config: {
        name: "wordgame",
        aliases: ["word"],
        version: "0.0.7",
        author: "Azadx69x",
        role: 0,
        category: "game",
    },

    onStart: async function ({ api, event, usersData }) {
        try {
            if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();

            const wordApi = "https://azadx69x-all-apis-top.vercel.app/api/word";
            const w = (await axios.get(wordApi)).data.word;

            const wordMsg = `🔤 𝐒𝐜𝐫𝐚𝐦𝐛𝐥𝐞𝐝 𝐋𝐞𝐭𝐭𝐞𝐫𝐬: "${w.question}"
❓ 𝐂𝐚𝐧 𝐲𝐨𝐮 𝐟𝐢𝐠𝐮𝐫𝐞 𝐨𝐮𝐭 𝐭𝐡𝐞 𝐰𝐨𝐫𝐝?`;

            api.sendMessage(wordMsg, event.threadID, (err, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    type: "reply",
                    commandName: this.config.name,
                    author: event.senderID,
                    messageID: info.messageID,
                    correctAnswer: w.answer.toLowerCase()
                });

                setTimeout(() => {
                    try { api.unsendMessage(info.messageID); } catch {}
                    global.GoatBot.onReply.delete(info.messageID);
                }, 40000);
            }, event.messageID);

        } catch (error) {
            api.sendMessage(`❌ 𝐄𝐫𝐫𝐨𝐫: ${error.message}`, event.threadID, event.messageID);
        }
    },

    onReply: async function ({ api, event, Reply, usersData }) {
        if (!Reply) return;

        const { correctAnswer, author } = Reply;

        if (event.senderID !== author)
            return api.sendMessage(
                "🐸 𝐎𝐨𝐩𝐬, 𝐭𝐡𝐢𝐬 𝐠𝐚𝐦𝐞 𝐢𝐬 𝐧𝐨𝐭 𝐟𝐨𝐫 𝐲𝐨𝐮!",
                event.threadID,
                event.messageID
            );

        const userReply = event.body.trim().toLowerCase();
        const userData = await usersData.get(author);
        const rewardCoins = 20000;
        const rewardExp = 5000;

        try { await api.unsendMessage(Reply.messageID); } catch {}
        global.GoatBot.onReply.delete(Reply.messageID);

        if (userReply === correctAnswer) {
            await usersData.set(author, {
                money: userData.money + rewardCoins,
                exp: userData.exp + rewardExp,
                data: userData.data
            });

            return api.sendMessage(
                `✅ 𝐂𝐨𝐫𝐫𝐞𝐜𝐭!\n🎁 +${rewardCoins} 𝐂𝐨𝐢𝐧𝐬\n⭐ +${rewardExp} 𝐄𝐗𝐏`,
                event.threadID,
                event.messageID
            );
        } else {
            return api.sendMessage(
                `💔 𝐍𝐨𝐩𝐞!\n✔ 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐖𝐨𝐫𝐝: ${correctAnswer}`,
                event.threadID,
                event.messageID
            );
        }
    }
};
