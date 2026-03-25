const request = require("request");
const { createReadStream, createWriteStream, existsSync } = require("fs-extra");
const path = require("path");

async function emojiEdit(api, threadID, emojis, delay = 700) {
  return new Promise(async (resolve) => {
    api.sendMessage(emojis[0], threadID, async (err, info) => {
      if (err) return;
      const msgID = info.messageID;

      for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, delay));
        api.editMessage(emojis[i], msgID);
      }

      resolve(msgID);
    });
  });
}

async function animatedMenu(api, threadID, frames, delay = 500) {
  return new Promise(resolve => {
    api.sendMessage(frames[0], threadID, (err, info) => {
      if (err) return;
      const msgID = info.messageID;
      (async () => {
        for (let i = 1; i < frames.length; i++) {
          await new Promise(r => setTimeout(r, delay));
          api.editMessage(frames[i], msgID);
        }
      })();
      resolve(msgID);
    });
  });
}

module.exports = {
  config: {
    name: "casino",
    version: "2.1.0",
    author: "Azadx69x",
    role: 0,
    category: "games",
    guide: "{p}casino"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const moneyUser = await usersData.get(senderID, "money") || 0;

    const choose = args[0];
    const kqua = parseInt(args[1]);
    const betAmount = parseInt(args[2]);
    
    const imgPath = path.join(__dirname, "cache", "casino.png");
    if (!existsSync(imgPath)) {
      request("https://files.catbox.moe/ijl2ub.png").pipe(createWriteStream(imgPath));
    }
    
    if (!choose) {
      const menuFrames = [
`🎰 ── WELCOME TO CASINO ── 🎰

🎲 1. Big / Small
🎴 2. Even / Odd
💸 3. Lottery
🎫 4. Difference
🍒 5. Slot

💡 Reply with the number of the game you want to play
💰 Minimum bet: 50$`,
`🎰 ── WELCOME TO CASINO ── 🎰

🎲 1. Big / Small
🎴 2. Even / Odd
💸 3. Lottery
🎫 4. Difference
🍒 5. Slot

✨ Reply with the number to start! 💰`,
`🎰 ── WELCOME TO CASINO ── 🎰

🎲 1. Big / Small
🎴 2. Even / Odd
💸 3. Lottery
🎫 4. Difference
🍒 5. Slot

💡 Ready? Type the number! 💰`
      ];

      const msgID = await animatedMenu(api, threadID, menuFrames, 500);
      
      global.GoatBot.onReply.set(msgID, {
        commandName: "casino",
        author: senderID,
        type: "choosee"
      });

      return;
    }
    
    if (choose === "big" || choose === "small") {
      if (kqua < 50 || isNaN(kqua)) return api.sendMessage("Minimum bet 50$", threadID, messageID);
      if (moneyUser < kqua) return api.sendMessage("Not enough money", threadID, messageID);

      const loadID = await emojiEdit(api, threadID, ["🎲", "🎲 🎲", "🎲 🎲 🎲"], 500);
      const result = Math.random() < 0.5 ? "big" : "small";

      if (choose === result) {
        await usersData.addMoney(senderID, kqua * 2);
        return api.editMessage(`🎉 YOU WON\nResult: ${result}\n+${kqua * 2}$`, loadID);
      } else {
        await usersData.subtractMoney(senderID, kqua);
        return api.editMessage(`😢 YOU LOST\nResult: ${result}\n-${kqua}$`, loadID);
      }
    }
    
    if (choose === "even" || choose === "odd") {
      if (kqua < 50 || isNaN(kqua)) return api.sendMessage("Minimum bet 50$", threadID, messageID);
      if (moneyUser < kqua) return api.sendMessage("Not enough money", threadID, messageID);

      const loadID = await emojiEdit(api, threadID, ["🎴", "🎴 ➡️", "🎴 ➡️ 🎴"], 500);
      const num = Math.floor(Math.random() * 10);
      const result = num % 2 === 0 ? "even" : "odd";

      if (choose === result) {
        await usersData.addMoney(senderID, kqua * 2);
        return api.editMessage(`🎉 YOU WON\nNumber: ${num}\n+${kqua * 2}$`, loadID);
      } else {
        await usersData.subtractMoney(senderID, kqua);
        return api.editMessage(`😢 YOU LOST\nNumber: ${num}\n-${kqua}$`, loadID);
      }
    }
    
    if (choose === "lottery") {
      if (betAmount < 50 || isNaN(betAmount)) return api.sendMessage("Minimum bet 50$", threadID, messageID);
      if (moneyUser < betAmount) return api.sendMessage("Not enough money", threadID, messageID);

      const lottery = Math.floor(Math.random() * 100);
      const loadID = await emojiEdit(api, threadID, ["💸", "💸 💸", "💸 💸 💸"], 200);
      
      setTimeout(async () => {
        if (args[1] == lottery) {
          await usersData.addMoney(senderID, betAmount * 2);
          api.editMessage(`🎉 YOU WON\nResult: ${lottery}\n+${betAmount * 2}$`, loadID);
        } else {
          await usersData.subtractMoney(senderID, betAmount);
          api.editMessage(`😢 YOU LOST\nResult: ${lottery}\n-${betAmount}$`, loadID);
        }
      }, 10000);
    }
    
    if (choose === "slot") {
      if (kqua < 50 || isNaN(kqua)) return api.sendMessage("Minimum bet 50$", threadID, messageID);
      if (moneyUser < kqua) return api.sendMessage("Not enough money", threadID, messageID);

      const items = ["🍒","🍉","🍊","🍏","🍓","🍌"];
      const loadID = await emojiEdit(api, threadID, ["🎰", "🎰 🎲", "🎰 🎲 🎰", "🎰 🎲 🎰 🎲"], 600);

      const a = Math.floor(Math.random() * items.length);
      const b = Math.floor(Math.random() * items.length);
      const c = Math.floor(Math.random() * items.length);
      const win = a === b || b === c || a === c;

      if (win) await usersData.addMoney(senderID, kqua * 2);
      else await usersData.subtractMoney(senderID, kqua);

      return api.editMessage(
`🎰 ${items[a]} | ${items[b]} | ${items[c]} 🎰
${win ? "🎉 YOU WON +" + kqua * 2 : "😢 YOU LOST -" + kqua}`,
        loadID
      );
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const guide = {
      "1": "casino big/small [amount]",
      "2": "casino even/odd [amount]",
      "3": "casino lottery [number] [amount]",
      "4": "casino difference [number] [amount]",
      "5": "casino slot [amount]"
    };

    return api.sendMessage(
      guide[event.body]
        ? `Use: ${global.GoatBot.config.prefix}${guide[event.body]}`
        : "Invalid option",
      event.threadID,
      event.messageID
    );
  }
};
