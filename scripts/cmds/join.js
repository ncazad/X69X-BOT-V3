const fs = require("fs-extra");

module.exports = {
	config: {
		name: "join",
		version: "0.0.7",
		author: "Azadx69x",
		countDown: 5,
		role: 0,
		shortDescription: "𝐉𝐨𝐢𝐧 𝐆𝐫𝐨𝐮𝐩 𝐖𝐡𝐞𝐫𝐞 𝐁𝐨𝐭 𝐄𝐱𝐢𝐬𝐭𝐬",
		category: "owner",
		guide: {
			en: "{p}{n}"
		}
	},
    
	truncateName: function(name, maxLength = 30) {
		if (!name || name.trim() === "") return "𝐔𝐧𝐧𝐚𝐦𝐞𝐝 𝐆𝐫𝐨𝐮𝐩";
		if (name.length <= maxLength) return name;
		return name.substring(0, maxLength) + "'-'";
	},

	onStart: async function ({ api, event }) {
		try {
			const groupList = await api.getThreadList(50, null, ["INBOX"]);
		    
			const groups = groupList.filter(i => i.threadID && i.threadID.length >= 15);

			if (!groups.length) {
				return api.sendMessage("❌ | 𝐁𝐨𝐭 𝐈𝐬 𝐍𝐨𝐭 𝐈𝐧 𝐀𝐧𝐲 𝐆𝐫𝐨𝐮𝐩.", event.threadID);
			}
		    
			const groupsWithNames = await Promise.all(
				groups.map(async (g) => {
					try {
						let fullName = g.threadName;
					    
						if (!fullName || fullName.trim() === "") {
							const info = await api.getThreadInfo(g.threadID);
							fullName = info.threadName || info.name || "𝐔𝐧𝐧𝐚𝐦𝐞𝐝 𝐆𝐫𝐨𝐮𝐩";
						}
						
						return { 
							...g, 
							fullName: fullName,
							displayName: this.truncateName(fullName, 30),
							participantCount: g.participantIDs?.length || 0
						};
					} catch (e) {
						return { 
							...g, 
							fullName: g.threadName || "𝐔𝐧𝐧𝐚𝐦𝐞𝐝 𝐆𝐫𝐨𝐮𝐩",
							displayName: this.truncateName(g.threadName, 30),
							participantCount: g.participantIDs?.length || 0
						};
					}
				})
			);

			let msg = `╭─『 📂 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 』─╮\n\n`;

			groupsWithNames.forEach((g, i) => {
				const memberCount = g.participantCount || 0;
				msg += `┃ ${i + 1}. ${g.displayName}\n`;
				msg += `┃ 🆔 ${g.threadID}\n`;
				msg += `┃ 👥 ${memberCount}/𝐌𝐞𝐦𝐛𝐞𝐫𝐬\n`;
				msg += `┃\n`;
			});

			msg += `╰───────────────╯\n\n`;
			msg += `💬 𝐑𝐞𝐩𝐥𝐲 𝐖𝐢𝐭𝐡 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩 𝐍𝐮𝐦𝐛𝐞𝐫 𝐓𝐨 𝐉𝐨𝐢𝐧.`;

			const sent = await api.sendMessage(msg, event.threadID);

			global.GoatBot.onReply.set(sent.messageID, {
				commandName: "join",
				author: event.senderID,
				groups: groupsWithNames
			});

		} catch (err) {
			console.log("🥀 𝐂𝐡𝐮𝐝𝐥𝐢𝐧𝐠 𝐏𝐨𝐧𝐠 𝐁𝐚𝐛𝐲:", err);
			api.sendMessage("❌ | 𝐄𝐫𝐫𝐨𝐫 𝐆𝐞𝐭𝐭𝐢𝐧𝐠 𝐆𝐫𝐨𝐮𝐩 𝐋𝐢𝐬𝐭.", event.threadID);
		}
	},

	onReply: async function ({ api, event, Reply, args }) {
		if (event.senderID != Reply.author) return;

		const index = parseInt(args[0]);
		const groups = Reply.groups;

		if (isNaN(index) || index < 1 || index > groups.length) {
			return api.sendMessage("⚠️ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐆𝐫𝐨𝐮𝐩 𝐍𝐮𝐦𝐛𝐞𝐫.", event.threadID, event.messageID);
		}

		const group = groups[index - 1];
		const groupName = group.fullName || group.threadName || "𝐔𝐧𝐧𝐚𝐦𝐞𝐝 𝐆𝐫𝐨𝐮𝐩";

		try {
			const info = await api.getThreadInfo(group.threadID);
			const currentName = info.threadName || info.name || groupName;

			if (info.participantIDs.includes(event.senderID)) {
				return api.sendMessage(
					`⚠️ | 𝐘𝐨𝐮 𝐀𝐫𝐞 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐈𝐧\n${currentName}`,
					event.threadID,
					event.messageID
				);
			}

			if (info.participantIDs.length >= 250) {
				return api.sendMessage(
					`❌ | 𝐆𝐫𝐨𝐮𝐩 𝐈𝐬 𝐅𝐮𝐥𝐥\n${currentName}`,
					event.threadID,
					event.messageID
				);
			}

			await api.addUserToGroup(event.senderID, group.threadID);

			api.sendMessage(
				`✅ | 𝐉𝐨𝐢𝐧𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲\n${currentName}`,
				event.threadID,
				event.messageID
			);

		} catch (err) {
			console.log("𝐉𝐨𝐢𝐧 𝐑𝐞𝐩𝐥𝐲 𝐄𝐫𝐫𝐨𝐫:", err);
			api.sendMessage("❌ | 𝐂𝐡𝐮𝐝𝐥𝐢𝐧𝐠 𝐏𝐨𝐧𝐠", event.threadID, event.messageID);
		}

		global.GoatBot.onReply.delete(event.messageID);
	}
};
