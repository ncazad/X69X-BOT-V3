const { writeFileSync, readFileSync, existsSync } = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "premium",
        aliases: ["prem"],
        version: "0.0.7",
        author: "Azadx69x",
        role: 3,
        shortDescription: { en: "Manage premium users" },
        longDescription: { en: "Add or remove premium users (permanent)" },
        category: "owner",
        guide: {
            en: `Usage:
{pn} list
{pn} add <uid|@mention|reply>
{pn} remove <uid|@mention|reply>

Example: {pn} add @user`
        }
    },

    langs: {
        en: {
            usageGuide: `⚠️ 𝗨𝘀𝗮𝗴𝗲:\n{pn} list\n{pn} add @mention\n{pn} remove @mention`,
            listPremium: `💎 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗨𝘀𝗲𝗿𝘀:\n%1`,
            noPremium: "⚠️ 𝗡𝗼 𝗽𝗿𝗲𝗺𝗶𝘂𝗺 𝘂𝘀𝗲𝗿𝘀 𝗳𝗼𝘂𝗻𝗱!",
            added: `✅ 𝗔𝗱𝗱𝗲𝗱 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗨𝘀𝗲𝗿𝘀:\n%2`,
            alreadyPremium: `⚠️ 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗨𝘀𝗲𝗿𝘀:\n%2`,
            removed: `❌ 𝗥𝗲𝗺𝗼𝘃𝗲𝗱 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗨𝘀𝗲𝗿𝘀:\n%2`,
            notPremium: `⚠️ 𝗡𝗼𝘁 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗨𝘀𝗲𝗿𝘀:\n%2`,
            missingIdAdd: "⚠️ UID/mention needed to add premium.",
            missingIdRemove: "⚠️ UID/mention needed to remove premium."
        }
    },

    onStart: async function ({ message, args, event, api, getLang, prefix }) {
        let configPath = global.GoatBot?.config?.path || 
                        global.GoatBot?.dirConfig || 
                        path.join(process.cwd(), "config.json");
        
        let configData = {};
        
        try {
            if (existsSync(configPath)) {
                configData = JSON.parse(readFileSync(configPath, "utf8"));
            }
        } catch (e) {
            console.error(`[Premium] Error:`, e.message);
            return message.reply(`❌ Config error: ${e.message}`);
        }
        
        let premiumUsers = [];
        if (Array.isArray(configData.premium)) {
            premiumUsers = configData.premium.map(item => {
                return typeof item === "string" ? { uid: item } : item;
            });
        }

        if (!args || args.length === 0) {
            return message.reply(getLang("usageGuide").replace(/{pn}/g, `${prefix}${this.config.name}`));
        }

        const getUserName = async (uid) => {
            try {
                const userInfo = await api.getUserInfo(uid);
                if (userInfo?.[uid]?.name) return userInfo[uid].name;
            } catch {}
            return "Unknown";
        };

        const formatUser = async (uid) => {
            const name = await getUserName(uid);
            return `👨‍💻 𝗡𝗮𝗺𝗲: ${name}\n    ➥  (${uid})`;
        };
        
        if (args[0] === "list" || args[0] === "-l") {
            if (premiumUsers.length === 0) {
                return message.reply(getLang("noPremium"));
            }
            const list = await Promise.all(premiumUsers.map(u => formatUser(u.uid)));
            return message.reply(getLang("listPremium").replace("%1", list.join("\n")));
        }
        
        let uids = [];

        if (Object.keys(event.mentions || {}).length) {
            uids = Object.keys(event.mentions);
        } else if (event.messageReply) {
            uids = [event.messageReply.senderID];
        } else {
            uids = args.slice(1).filter(a => /^\d+$/.test(a));
        }

        if (uids.length === 0) {
            const usage = getLang("usageGuide").replace(/{pn}/g, `${prefix}${this.config.name}`);
            if (args[0] === "add") return message.reply(getLang("missingIdAdd") + "\n" + usage);
            if (args[0] === "remove") return message.reply(getLang("missingIdRemove") + "\n" + usage);
            return message.reply(usage);
        }

        uids = [...new Set(uids)];

        const added = [], removed = [], existed = [], notFound = [];

        for (const uid of uids) {
            const index = premiumUsers.findIndex(u => u.uid === uid);

            if (args[0] === "add") {
                if (index !== -1) {
                    existed.push(uid);
                } else {
                    premiumUsers.push({ uid });
                    added.push(uid);
                }
            } else if (args[0] === "remove") {
                if (index === -1) {
                    notFound.push(uid);
                } else {
                    premiumUsers.splice(index, 1);
                    removed.push(uid);
                }
            } else {
                return message.reply(getLang("usageGuide").replace(/{pn}/g, `${prefix}${this.config.name}`));
            }
        }
        
        try {
            configData.premium = premiumUsers;
            writeFileSync(configPath, JSON.stringify(configData, null, 2));
        } catch (e) {
            return message.reply(`❌ Save failed: ${e.message}`);
        }
        
        const formatUsers = async (arr) => (await Promise.all(arr.map(formatUser))).join("\n");
        
        let msg = "";
        if (added.length) msg += getLang("added").replace("%2", await formatUsers(added)) + "\n";
        if (removed.length) msg += getLang("removed").replace("%2", await formatUsers(removed)) + "\n";
        if (existed.length) msg += getLang("alreadyPremium").replace("%2", await formatUsers(existed)) + "\n";
        if (notFound.length) msg += getLang("notPremium").replace("%2", await formatUsers(notFound)) + "\n";

        return message.reply(msg.trim() || getLang("usageGuide").replace(/{pn}/g, `${prefix}${this.config.name}`));
    }
};
