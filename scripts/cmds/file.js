const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "file",
        version: "0.0.7",
        author: "Azadx69x",
        countDown: 3,
        role: 0,
        shortDescription: "𝐛𝐨𝐭 𝐟𝐢𝐥𝐞",
        longDescription: "𝐒𝐞𝐧𝐝 𝐛𝐨𝐭 𝐟𝐢𝐥𝐞 𝐟𝐫𝐨𝐦 𝐜𝐦𝐝𝐬",
        category: "owner",
        guide: "{pn} <𝐟𝐢𝐥𝐞𝐧𝐚𝐦𝐞>"
    },

    onStart: async function ({ message, args, api, event }) {

        const permission = [
            "61585772322631",
            "61588403646276",
            "",
            ""
        ];

        if (!permission.includes(event.senderID)) {
            return api.sendMessage(
                "😾 𝐭𝐨𝐫 𝐦𝐚𝐫𝐞𝐜𝐡𝐮𝐝𝐢 𝐭𝐮𝐢 𝐚𝐝𝐦𝐢𝐧 𝐧𝐚!",
                event.threadID,
                event.messageID
            );
        }

        if (!args[0]) {
            return api.sendMessage(
                "⚠️ 𝐅𝐢𝐥𝐞 𝐧𝐚𝐦𝐞 𝐦𝐢𝐬𝐬𝐢𝐧𝐠!",
                event.threadID,
                event.messageID
            );
        }

        const fileName = args[0].trim();
        const possibleExtensions = [".js", ".json", ".txt"];
        let filePath = null;

        for (let ext of possibleExtensions) {
            let check = path.join(__dirname, fileName + ext);
            if (fs.existsSync(check)) filePath = check;
        }

        if (!filePath) {
            const cmds = path.join(process.cwd(), "cmds");
            for (let ext of possibleExtensions) {
                let check = path.join(cmds, fileName + ext);
                if (fs.existsSync(check)) filePath = check;
            }
        }

        if (!filePath) {
            return api.sendMessage(
                "🚫 𝐅𝐢𝐥𝐞 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!",
                event.threadID,
                event.messageID
            );
        }

        try {
            const fileContent = fs.readFileSync(filePath, "utf8");

            const styledText = `${fileContent}`;

            api.sendMessage(styledText, event.threadID);

        } catch (err) {
            api.sendMessage(
                "❌ 𝐄𝐫𝐫𝐨𝐫 𝐫𝐞𝐚𝐝𝐢𝐧𝐠 𝐟𝐢𝐥𝐞!",
                event.threadID,
                event.messageID
            );
        }
    }
};
