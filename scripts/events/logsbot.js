const { getTime } = global.utils;

module.exports = {
    config: {
        name: "logsbot",
        isBot: true,
        version: "1.4",
        author: "NTKhang",
        envConfig: { allow: true },
        category: "events"
    },

    langs: {
        en: {
            title: "====== Bot logs ======",
            added: "\n✅\nEvent: bot has been added to a new group\n- Added by: %1",
            kicked: "\n❌\nEvent: bot has been kicked\n- Kicked by: %1",
            footer: "\n- User ID: %1\n- Group: %2\n- Group ID: %3\n- Time: %4"
        }
    },

    onStart: async ({ usersData, threadsData, event, api, getLang }) => {
        const botID = api.getCurrentUserID();

        // Only run if bot is added or removed
        if (
            (event.logMessageType === "log:subscribe" &&
                event.logMessageData.addedParticipants.some((p) => p.userFbId === botID)) ||
            (event.logMessageType === "log:unsubscribe" &&
                event.logMessageData.leftParticipantFbId === botID)
        ) {
            try {
                const { author, threadID } = event;
                if (author === botID) return;

                let msg = getLang("title");
                let threadName = "";

                const { config } = global.GoatBot;

                if (event.logMessageType === "log:subscribe") {
                    threadName = (await api.getThreadInfo(threadID)).threadName;
                    const authorName = await usersData.getName(author);
                    msg += getLang("added", authorName);
                } else if (event.logMessageType === "log:unsubscribe") {
                    const authorName = await usersData.getName(author);
                    const threadData = await threadsData.get(threadID);
                    threadName = threadData.threadName;
                    msg += getLang("kicked", authorName);
                }

                const time = getTime("DD/MM/YYYY HH:mm:ss");
                msg += getLang("footer", author, threadName, threadID, time);

                for (const adminID of config.adminBot) {
                    api.sendMessage(msg, adminID);
                }
            } catch (err) {
                console.error("logsbot.js error:", err);
            }
        }
    }
};
