const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
    config: {
        name: "admin",
        aliases: ["ad"],
        version: "0.0.7",
        author: "Azadx69x",
        countDown: 5,
        role: 4,
        shortDescription: { en: "Add, remove or view the admin list" },
        longDescription: { en: "Manage bot admins — add/remove/view" },
        category: "admin",
        guide: { en: "Usage:\n{pn} list\n{pn} add <uid|tag|reply>\n{pn} remove <uid|tag|reply>" }
    },

    langs: {
        en: {
            listAdmin: `✿•≫─•『𝗔𝗱𝗺𝗶𝗻』•─≪•✿\n%1\n✿•≫──────────≪•✿`,
            noAdmin: "⚠️ 𝗡𝗼 𝗔𝗱𝗺𝗶𝗻𝘀 𝗙𝗼𝘂𝗻𝗱!",
            added: `✅ 𝐀𝐝𝐝𝐞𝐝 𝐀𝐝𝐦𝐢𝐧:\n%1`,
            alreadyAdmin: `⚠️ 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐀𝐝𝐦𝐢𝐧:\n%1`,
            removed: `❌ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝 𝐀𝐝𝐦𝐢𝐧:\n%1`,
            notAdmin: `⚠️ 𝐍𝐨𝐭 𝐀𝐝𝐦𝐢𝐧:\n%1`,
            missingIdAdd: "⚠️ Tag/reply/UID needed to add admin.",
            missingIdRemove: "⚠️ Tag/reply/UID needed to remove admin.",
            notAllowed: "⛔ You are not allowed to use this!"
        }
    },

    onStart: async function ({ message, args, event, usersData, getLang }) {
        const senderID = event.senderID;
      
        const getName = async (uid) => {
            uid = uid.toString();
            try {
                const name = await usersData.getName(uid);
                return name || "Unknown";
            } catch {
                return "Unknown";
            }
        };

        const formatAdmin = async (uid) => {
            const name = await getName(uid);
            return `🎀 𝐍𝐚𝐦𝐞: ${name}\n🪪 𝗨𝗜𝗗: ${uid}`;
        };
      
        if (args[0] === "list" || args[0] === "-l") {
            if (!config.adminBot.length) return message.reply(getLang("noAdmin"));
            const adminList = await Promise.all(config.adminBot.map(formatAdmin));
            return message.reply(getLang("listAdmin", adminList.join("\n\n")));
        }
      
        if (!config.adminBot.includes(senderID) && ["add","-a","remove","-r"].includes(args[0]))
            return message.reply(getLang("notAllowed"));
      
        let uids = [];
        if (event.mentions && Object.keys(event.mentions).length) {
            uids = Object.keys(event.mentions);
        } else if (event.type === "message_reply" && event.messageReply?.senderID) {
            uids = [event.messageReply.senderID];
        } else {
            uids = args.slice(1).filter(a => !isNaN(a));
        }
        uids = uids.map(u => u.toString());
      
        if (args[0] === "add" || args[0] === "-a") {
            if (!uids.length) return message.reply(getLang("missingIdAdd"));

            const newAdmins = [];
            const alreadyAdmins = [];

            for (const uid of uids) {
                if (config.adminBot.includes(uid)) alreadyAdmins.push(uid);
                else newAdmins.push(uid);
            }

            config.adminBot.push(...newAdmins);
            writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            const newList = await Promise.all(newAdmins.map(formatAdmin));
            const alreadyList = await Promise.all(alreadyAdmins.map(formatAdmin));

            return message.reply(
                (newList.length ? getLang("added", newList.join("\n\n")) : "") +
                (alreadyList.length ? "\n" + getLang("alreadyAdmin", alreadyList.join("\n\n")) : "")
            );
        }
      
        if (args[0] === "remove" || args[0] === "-r") {
            if (!uids.length) return message.reply(getLang("missingIdRemove"));

            const removed = [];
            const notAdmins = [];

            for (const uid of uids) {
                if (config.adminBot.includes(uid)) {
                    removed.push(uid);
                    config.adminBot.splice(config.adminBot.indexOf(uid), 1);
                } else notAdmins.push(uid);
            }

            writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            const removedList = await Promise.all(removed.map(formatAdmin));
            const notList = await Promise.all(notAdmins.map(formatAdmin));

            return message.reply(
                (removedList.length ? getLang("removed", removedList.join("\n\n")) : "") +
                (notList.length ? "\n" + getLang("notAdmin", notList.join("\n\n")) : "")
            );
        }

        return message.reply("Use: list / add / remove");
    }
};
