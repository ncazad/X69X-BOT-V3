const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify"],
		version: "0.0.7",
		author: "NTKhang | Azadx69x",
		countDown: 5,
		role: 2,
		description: {
			en: "📢 𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐭𝐨 𝐀𝐥𝐥 𝐆𝐫𝐨𝐮𝐩𝐬"
		},
		category: "Admin",
		guide: {
			en: "{pn} <𝐦𝐞𝐬𝐬𝐚𝐠𝐞>\n𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚𝐭𝐭𝐚𝐜𝐡𝐦𝐞𝐧𝐭𝐬 𝐭𝐨 𝐢𝐧𝐜𝐥𝐮𝐝𝐞 𝐦𝐞𝐝𝐢𝐚\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: {pn} 𝐒𝐞𝐫𝐯𝐞𝐫 𝐦𝐚𝐢𝐧𝐭𝐞𝐧𝐚𝐧𝐜𝐞 𝐭𝐨𝐧𝐢𝐠𝐡𝐭!"
		},
		envConfig: {
			delayPerGroup: 250,
			enableConfirmation: true
		},
		adminBot: [
			"61585772322631","61588403646276"
		]
	},

	langs: {
		en: {
			missingMessage: "⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐬𝐞𝐧𝐝",
			sendingNotification: "📤 𝐒𝐞𝐧𝐝𝐢𝐧𝐠 𝐭𝐨 %1 𝐠𝐫𝐨𝐮𝐩𝐬...",
			confirmSend: "⚠️ 𝐒𝐞𝐧𝐝 𝐭𝐨 %1 𝐠𝐫𝐨𝐮𝐩𝐬?\n𝐑𝐞𝐩𝐥𝐲: yes | no",
			cancelled: "❌ 𝐂𝐚𝐧𝐜𝐞𝐥𝐥𝐞𝐝",
			processing: "⏳ 𝐒𝐞𝐧𝐝𝐢𝐧𝐠...",
			noGroups: "❌ 𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐠𝐫𝐨𝐮𝐩𝐬 𝐟𝐨𝐮𝐧𝐝",
			notAdminBot: "⛔ 𝐀𝐝𝐦𝐢𝐧 𝐚𝐜𝐜𝐞𝐬𝐬 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝",
			invalidReply: "⚠️ 𝐑𝐞𝐩𝐥𝐲 'yes' 𝐨𝐫 'no'",
			sendSuccess: "✅ 𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐬𝐞𝐧𝐭!\n\n📊 𝐒𝐭𝐚𝐭𝐬:\n• 𝐓𝐨𝐭𝐚𝐥: %1\n• 𝐒𝐮𝐜𝐜𝐞𝐬𝐬: %2\n• 𝐅𝐚𝐢𝐥𝐞𝐝: %3\n⏱️ 𝐓𝐢𝐦𝐞: %4"
		}
	},

	onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
		try {
			if (!(this.config.adminBot || []).includes(event.senderID)) {
				return message.reply(getLang("notAdminBot"));
			}

			if (!args[0]) return message.reply(getLang("missingMessage"));

			const botID = api.getCurrentUserID();
		  
			let allThreads = (await threadsData.getAll()).filter(
				t => t.isGroup && t.members?.find(m => m.userID == botID)?.inGroup
			);

			if (allThreads.length === 0) return message.reply(getLang("noGroups"));
		  
			const delayPerGroup = envCommands[commandName]?.delayPerGroup || 300;
			const enableConfirmation = envCommands[commandName]?.enableConfirmation !== false;
			
			if (enableConfirmation && allThreads.length > 3) {
				const confirmation = await message.reply(getLang("confirmSend", allThreads.length));
				global.GoatBot.onReply.set(confirmation.messageID, {
					commandName,
					messageID: confirmation.messageID,
					author: event.senderID,
					allThreads,
					args,
					attachments: event.attachments || [],
					messageReply: event.messageReply,
					delayPerGroup
				});
				return;
			}

			const loadingMsg = await message.reply(getLang("sendingNotification", allThreads.length));
			
			await executeNotification(message, api, event, args, allThreads, delayPerGroup, getLang, loadingMsg);

		} catch (error) {
			console.error("𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐄𝐫𝐫𝐨𝐫:", error);
			await message.reply(`❌ 𝐄𝐫𝐫𝐨𝐫: ${error.message}`);
		}
	},

	onReply: async function ({ message, Reply, event, api, getLang }) {
		try {
			if (event.senderID !== Reply.author) return;

			const { allThreads, args, attachments, messageReply, delayPerGroup } = Reply;
			const response = event.body?.toLowerCase()?.trim();
			
			if (response === "yes" || response === "y") {
				const processingMsg = await message.reply(getLang("processing"));
				await api.unsendMessage(Reply.messageID);
				
				await executeNotification(message, api, event, args, allThreads, delayPerGroup, getLang, processingMsg);
				global.GoatBot.onReply.delete(Reply.messageID);
			} else if (response === "no" || response === "n" || response === "cancel") {
				await message.reply(getLang("cancelled"));
				global.GoatBot.onReply.delete(Reply.messageID);
			} else {
				await message.reply(getLang("invalidReply"));
			}
		} catch (error) {
			console.error("𝐑𝐞𝐩𝐥𝐲 𝐡𝐚𝐧𝐝𝐥𝐞𝐫 𝐞𝐫𝐫𝐨𝐫:", error);
		}
	}
};

function getBangladeshTime() {
	const now = new Date();
	const options = {
		timeZone: 'Asia/Dhaka',
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
		hour12: true
	};
	return now.toLocaleString('en-GB', options);
}

async function executeNotification(message, api, event, args, allThreads, delayPerGroup, getLang, loadingMsg) {
	const startTime = Date.now();
	
	try {
		let attachmentsStream = [];
		try {
			const allAttachments = [
				...(event.attachments || []),
				...(event.messageReply?.attachments || [])
			].filter(item => item && ["photo", "png", "animated_image", "video", "audio", "sticker", "file"].includes(item.type));

			if (allAttachments.length > 0) {
				attachmentsStream = await getStreamsFromAttachment(allAttachments);
			}
		} catch (err) {
			console.error("𝐀𝐭𝐭𝐚𝐜𝐡𝐦𝐞𝐧𝐭 𝐞𝐫𝐫𝐨𝐫:", err);
		}

		const messageBody = args.join(" ");
		let sendSuccess = 0;
		let sendFailed = 0;

		for (const [index, thread] of allThreads.entries()) {
			const threadID = thread.threadID;
			const groupName = thread.threadName || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";

			try {
				const announcement = `┏━━━━━━━━━━━━━━━━━┓\n    📢  𝐀𝐃𝐌𝐈𝐍 𝐍𝐎𝐓𝐈𝐂𝐄  \n┗━━━━━━━━━━━━━━━━━┛\n\n💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞:\n${messageBody}\n\n📍 𝐆𝐫𝐨𝐮𝐩: ${groupName}\n👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${thread.members?.length || 'N/A'}\n━━━━━━━━━━━━━━━━━━\n🤖 𝐒𝐞𝐧𝐭 𝐛𝐲: 𝐀𝐳𝐚𝐝𝐱𝟔𝟗𝐱\n🕐 ${getBangladeshTime()}`;

				await api.sendMessage({
					body: announcement,
					attachment: attachmentsStream
				}, threadID);

				sendSuccess++;
				console.log(`✅ ${groupName}`);

				if (index < allThreads.length - 1) {
					await new Promise(r => setTimeout(r, delayPerGroup));
				}

			} catch (error) {
				console.error(`❌ ${groupName}:`, error);
				sendFailed++;
			}
		}
	  
		const duration = ((Date.now() - startTime) / 1000).toFixed(1);
		
		const result = getLang("sendSuccess", allThreads.length, sendSuccess, sendFailed, `${duration}s`);
		
		if (loadingMsg && loadingMsg.messageID) {
			await api.unsendMessage(loadingMsg.messageID);
		}

		await message.reply(result);

	} catch (error) {
		console.error("𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐟𝐚𝐢𝐥𝐞𝐝:", error);
		
		if (loadingMsg && loadingMsg.messageID) {
			await api.unsendMessage(loadingMsg.messageID).catch(() => {});
		}
		
		await message.reply(`❌ 𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐟𝐚𝐢𝐥𝐞𝐝: ${error.message}`);
	}
}
