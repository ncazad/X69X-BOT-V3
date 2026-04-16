const fs = require("fs");
const path = require("path");

const COUNTER_FILE = path.join(__dirname, "..", "unfriend_counter.json");

let removedCount = 0;
try {
        if (fs.existsSync(COUNTER_FILE)) {
                const data = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf8"));
                removedCount = data.count || 0;
        }
} catch (e) {
        removedCount = 0;
}

function saveCounter() {
        try {
                fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count: removedCount, lastUpdated: Date.now() }), "utf8");
        } catch (e) {
                console.error("Failed to save unfriend counter:", e);
        }
}

module.exports = {
        config: {
                name: "unfriend",
                version: "3.0",
                author: "Azadx69x",
                role: 4,
                countDown: 5,
                shortDescription: {
                        en: "Unfriend System"
                },
                longDescription: {
                        en: "Remove friends from bot account"
                },
                category: "owner",
                guide: {
                        en: "{p}unfriend [number] - Remove specific amount\n{p}unfriend list - Show stats\n{p}unfriend friend - Show friend count\n{p}unfriend all - Remove ALL friends (needs confirm)\n{p}unfriend inactive [days] - Remove friends not chatted in X days\n{p}unfriend notgroup - Remove friends not in any group with bot"
                }
        },

        onStart: async function ({ api, event, args, message, usersData, threadsData }) {
                const command = args[0]?.toLowerCase();

                if (!command) {
                        return message.reply(
                                `📋 Usage:\n` +
                                `• {p}unfriend 50 → Remove 50 friends\n` +
                                `• {p}unfriend list → Show statistics\n` +
                                `• {p}unfriend friend → Count friends\n` +
                                `• {p}unfriend all → Remove ALL (confirm needed)\n` +
                                `• {p}unfriend inactive 30 → Remove inactive 30+ days\n` +
                                `• {p}unfriend notgroup → Remove non-group friends`
                        );
                }
          
                if (command === "list" || command === "stats") {
                        return message.reply(
                                `📊 Unfriend Statistics\n\n` +
                                `❌ Total Unfriended (All Time): ${removedCount.toLocaleString()}\n` +
                                `💾 Data File: ${fs.existsSync(COUNTER_FILE) ? "✅ Saved" : "❌ Not Found"}`
                        );
                }

                try {
                        const friends = await api.getFriendsList();
                  
                        if (command === "friend" || command === "count") {
                                const validCount = friends.filter(f => f.userID && f.userID !== "0" && f.userID !== 0 && String(f.userID).length > 3).length;
                                return message.reply(
                                        `👥 Friend Status\n\n` +
                                        `Total Friends: ${friends.length.toLocaleString()}\n` +
                                        `Valid (Unfriendable): ${validCount.toLocaleString()}\n` +
                                        `Bot UID: ${api.getCurrentUserID()}`
                                );
                        }
                  
                        if (!friends || friends.length === 0) {
                                return message.reply("❌ No friends found or unable to fetch friend list.");
                        }

                        const validFriends = friends.filter(f => f.userID && f.userID !== "0" && f.userID !== 0 && String(f.userID).length > 3);
                        if (validFriends.length === 0) {
                                return message.reply("❌ No valid friends found in the list.");
                        }

                        let target = [];
                        let reason = "";
                  
                        switch (command) {
                                case "all":
                                        if (args[1] !== "confirm") {
                                                return message.reply(
                                                        `⚠️ WARNING: DESTRUCTIVE ACTION\n\n` +
                                                        `You are about to unfriend ALL ${validFriends.length} FRIENDS!\n\n` +
                                                        `This action cannot be undone!\n` +
                                                        `Type: {p}unfriend all confirm`
                                                );
                                        }
                                        target = validFriends;
                                        reason = "Mass unfriend (ALL)";
                                        break;

                                case "inactive": {
                                        const days = parseInt(args[1]) || 30;
                                        const inbox = await api.getThreadList(200, null, ["INBOX"]);
                                        const now = Date.now();
                                  
                                        const lastChatTimes = new Map();
                                        for (const thread of inbox) {
                                                if (thread.participantIDs) {
                                                        for (const uid of thread.participantIDs) {
                                                                const current = lastChatTimes.get(uid) || 0;
                                                                const threadTime = new Date(thread.lastMessageTimestamp).getTime() || 0;
                                                                if (threadTime > current) {
                                                                        lastChatTimes.set(uid, threadTime);
                                                                }
                                                        }
                                                }
                                        }

                                        const cutoffTime = now - (days * 24 * 60 * 60 * 1000);
                                        target = validFriends.filter(f => {
                                                const lastChat = lastChatTimes.get(f.userID) || 0;
                                                return lastChat < cutoffTime;
                                        });
                                        reason = `Inactive for ${days}+ days`;
                                        break;
                                }

                                case "notgroup": {
                                        const groups = await api.getThreadList(100, null, ["INBOX"]);
                                        const groupMembers = new Set();
                                        
                                        for (const group of groups) {
                                                if (group.isGroup && group.participantIDs) {
                                                        group.participantIDs.forEach(id => groupMembers.add(id));
                                                }
                                        }

                                        target = validFriends.filter(f => !groupMembers.has(f.userID));
                                        reason = "Not in any group with bot";
                                        break;
                                }

                                default: {
                                        const amount = parseInt(command);
                                        if (isNaN(amount) || amount <= 0) {
                                                return message.reply("❌ Invalid command. Use: {p}unfriend [number|list|friend|all|inactive|notgroup]");
                                        }
                                        if (amount > validFriends.length) {
                                                return message.reply(`❌ You only have ${validFriends.length} valid friends. Cannot remove ${amount}.`);
                                        }
                                        target = validFriends.slice(0, amount);
                                        reason = `Batch remove (${amount})`;
                                        break;
                                }
                        }

                        if (target.length === 0) {
                                return message.reply("✅ No friends match the criteria.");
                        }
                  
                        if (target.length > 10 && args[1] !== "confirm" && command !== "all") {
                                return message.reply(
                                        `⚠️ About to unfriend ${target.length} friends (${reason}).\n` +
                                        `Type: {p}unfriend ${command} confirm`
                                );
                        }
                  
                        let removed = 0;
                        let failed = 0;
                        const failedList = [];
                        const startTime = Date.now();
                  
                        let lastProgressTime = Date.now();
                        
                        for (let i = 0; i < target.length; i++) {
                                const friend = target[i];
                                try {
                                        await api.unfriend(friend.userID);
                                        removed++;
                                        removedCount++;
                                  
                                        const now = Date.now();
                                        if ((i + 1) % 10 === 0 || (now - lastProgressTime > 10000) || i === target.length - 1) {
                                                await message.reply(
                                                        `🔄 Progress Update\n` +
                                                        `Processed: ${i + 1}/${target.length}\n` +
                                                        `✅ Removed: ${removed}\n` +
                                                        `❌ Failed: ${failed}`
                                                );
                                                lastProgressTime = now;
                                        }
                                  
                                        await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
                                        
                                } catch (err) {
                                        failed++;
                                        failedList.push({ uid: friend.userID, name: friend.name || "Unknown", error: err.message });
                                        console.error(`Failed to unfriend ${friend.userID}:`, err);
                                        await new Promise(r => setTimeout(r, 2000));
                                }
                        }
                  
                        saveCounter();

                        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                        
                        let resultMsg = 
                                `✅ Unfriend Complete\n\n` +
                                `📊 Stats:\n` +
                                `• Target: ${target.length}\n` +
                                `• Removed: ${removed}\n` +
                                `• Failed: ${failed}\n` +
                                `• Time: ${duration}s\n` +
                                `• Reason: ${reason}\n\n` +
                                `📈 Total All-Time: ${removedCount}`;

                        if (failed > 0 && failed <= 5) {
                                resultMsg += `\n\n⚠️ Failed IDs: ${failedList.map(f => f.uid).join(", ")}`;
                        }

                        return message.reply(resultMsg);

                } catch (err) {
                        console.error("Unfriend system error:", err);
                        return message.reply(`❌ Error: ${err.message || "Unknown error occurred"}`);
                }
        }
};
