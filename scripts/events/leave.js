const { getTime, drive } = global.utils;

module.exports = {
        config: {
                name: "leave",
                version: "1.5",
                author: "NTKhang (fixed by Azadx69x)",
                category: "events"
        },

        langs: {
                vi: {
                        session1: "sáng",
                        session2: "trưa",
                        session3: "chiều",
                        session4: "tối",
                        leaveType1: "tự rời",
                        leaveType2: "bị kick",
                        defaultLeaveMessage: "{userName} đã {type} khỏi nhóm"
                },
                en: {
                        session1: "morning",
                        session2: "noon",
                        session3: "afternoon",
                        session4: "evening",
                        leaveType1: "left",
                        leaveType2: "was kicked from",
                        defaultLeaveMessage: "{userName} {type} the group"
                }
        },

        onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
                if (event.logMessageType !== "log:unsubscribe") return;

                try {
                        const { threadID } = event;
                        const threadData = await threadsData.get(threadID);

                        if (!threadData.settings.sendLeaveMessage) return;

                        const { leftParticipantFbId } = event.logMessageData;
                        if (leftParticipantFbId == api.getCurrentUserID()) return;

                        const hours = parseInt(getTime("HH"));
                        const threadName = threadData.threadName;
                        const userName = await usersData.getName(leftParticipantFbId);

                        let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

                        const leaveType = leftParticipantFbId == event.author
                                ? getLang("leaveType1")
                                : getLang("leaveType2");

                        let session;
                        if (hours <= 10) session = getLang("session1");
                        else if (hours <= 12) session = getLang("session2");
                        else if (hours <= 18) session = getLang("session3");
                        else session = getLang("session4");

                        leaveMessage = leaveMessage
                                .replace(/\{userName\}|\{userNameTag\}/g, userName)
                                .replace(/\{type\}/g, leaveType)
                                .replace(/\{threadName\}|\{boxName\}/g, threadName)
                                .replace(/\{time\}/g, hours)
                                .replace(/\{session\}/g, session);

                        const form = { body: leaveMessage };

                        if (leaveMessage.includes("{userNameTag}")) {
                                form.mentions = [{
                                        id: leftParticipantFbId,
                                        tag: userName
                                }];
                        }

                        if (threadData.data.leaveAttachment) {
                                const files = threadData.data.leaveAttachment;
                                const attachments = files.reduce((acc, file) => {
                                        acc.push(drive.getFile(file, "stream"));
                                        return acc;
                                }, []);
                                form.attachment = (await Promise.allSettled(attachments))
                                        .filter(({ status }) => status == "fulfilled")
                                        .map(({ value }) => value);
                        }

                        await message.send(form);

                } catch (err) {
                        console.error("[LEAVE EVENT] Error:", err.message);
                }
        }
};
