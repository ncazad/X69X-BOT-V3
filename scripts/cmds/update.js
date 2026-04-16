const os = require("os");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const dirBootLogTemp = path.join(__dirname, "..", "..", "tmp", "rebootUpdated.txt");

module.exports = {
  config: {
    name: "update",
    version: "0.0.7",
    author: "NTKhang | Azadx69x",
    role: 2,
    description: {
      en: "Check for and install updates for the chatbot.",
      bn: "চ্যাটবটের জন্য আপডেট চেক করুন এবং ইনস্টল করুন।"
    },
    category: "owner",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    en: {
      noUpdates:
"╭━━━━━━━━━━━━━━━━━╮\n"+
"│ 🚀 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯 𝗨𝗣𝗗𝗔𝗧𝗘\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ ✅ 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗨𝗣𝗗𝗔𝗧𝗘𝗗\n"+
"│ 📦 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 𝘃%1\n"+
"│ 📅 𝗗𝗮𝘁𝗲 : %2\n"+
"│ ⏰ 𝗧𝗶𝗺𝗲 : %3\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ 📊 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗦\n"+
"│ ⚡ 𝗦𝘁𝗮𝘁𝘂𝘀 : %4\n"+
"│ 💾 𝗠𝗲𝗺𝗼𝗿𝘆 : %5\n"+
"│ 🖥️ 𝗖𝗣𝗨 : %6\n"+
"│ ⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲 : %7\n"+
"╰━━━━━━━━━━━━━━━━━╯",

      updatePrompt:
"╭━━━━━━━━━━━━━━━━━╮\n"+
"│ 🚀 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯 𝗨𝗣𝗗𝗔𝗧𝗘\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ ✨ 𝗡𝗘𝗪 𝗨𝗣𝗗𝗔𝗧𝗘 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘\n"+
"│ 🔄 𝘃%1 → 𝘃%2\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ 📁 𝗙𝗜𝗟𝗘𝗦 𝗧𝗢 𝗨𝗣𝗗𝗔𝗧𝗘\n"+
"%3%4\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ 🌐 𝗴𝗶𝘁𝗵𝘂𝗯.𝗰𝗼𝗺/𝗻𝗰𝗮𝘇𝗮𝗱/𝗔𝘇𝗮𝗱𝘅𝟲𝟵𝘅\n"+
"│ 👍 𝗥𝗘𝗔𝗖𝗧 𝗧𝗢 𝗖𝗢𝗡𝗙𝗜𝗥𝗠\n"+
"╰━━━━━━━━━━━━━━━━━╯",

      fileWillDelete:
"\n│ 🗑️ 𝗙𝗜𝗟𝗘𝗦 𝗧𝗢 𝗗𝗘𝗟𝗘𝗧𝗘\n%1",

      andMore:
"\n│ ...𝗔𝗡𝗗 %1 𝗠𝗢𝗥𝗘 𝗙𝗜𝗟𝗘𝗦",

      updateConfirmed:
"╭━━━━━━━━━━━━━━━━━━╮\n"+
"│ 🚀 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯\n"+
"├━━━━━━━━━━━━━━━━━━┤\n"+
"│ ⏳ 𝗨𝗣𝗗𝗔𝗧𝗜𝗡𝗚 𝗕𝗢𝗧...\n"+
"│ 🔧 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧\n"+
"╰━━━━━━━━━━━━━━━━━━╯",

      updateComplete:
"╭━━━━━━━━━━━━━━━━━━╮\n"+
"│ 🚀 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯\n"+
"├━━━━━━━━━━━━━━━━━━┤\n"+
"│ ✅ 𝗨𝗣𝗗𝗔𝗧𝗘 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘\n"+
"│ 🔄 𝗥𝗘𝗦𝗧𝗔𝗥𝗧 𝗡𝗢𝗪?\n"+
"│ 💬 𝗥𝗘𝗣𝗟𝗬 : 𝘆𝗲𝘀 / 𝘆\n"+
"╰━━━━━━━━━━━━━━━━━━╯",

      updateTooFast:
"⚠️ 𝗨𝗣𝗗𝗔𝗧𝗘 𝗧𝗢𝗢 𝗙𝗔𝗦𝗧!\n⏳ 𝗪𝗔𝗜𝗧 %3𝗺 %4𝘀",

      botWillRestart:
"🔄 𝗕𝗢𝗧 𝗥𝗘𝗦𝗧𝗔𝗥𝗧𝗜𝗡𝗚..."
    },

    bn: {
      noUpdates:
"╭━━━━━━━━━━━━━━━━━╮\n"+
"│ 🚀 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯 আপডেট\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ ✅ ইতিমধ্যে আপডেট করা আছে\n"+
"│ 📦 ভার্সন : 𝘃%1\n"+
"│ 📅 তারিখ : %2\n"+
"│ ⏰ সময় : %3\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ 📊 সিস্টেম তথ্য\n"+
"│ ⚡ অবস্থা : %4\n"+
"│ 💾 মেমোরি : %5\n"+
"│ 🖥️ সিপিইউ : %6\n"+
"│ ⏱️ আপটাইম : %7\n"+
"╰━━━━━━━━━━━━━━━━━╯",

      updatePrompt:
"╭━━━━━━━━━━━━━━━━━╮\n"+
"│ 🚀 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯 আপডেট\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ ✨ নতুন আপডেট উপলব্ধ\n"+
"│ 🔄 𝘃%1 → 𝘃%2\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ 📁 আপডেট করার ফাইল\n"+
"%3%4\n"+
"├━━━━━━━━━━━━━━━━━┤\n"+
"│ 🌐 github.com/ncazad/Azadx69x\n"+
"│ 👍 নিশ্চিত করতে রিঅ্যাক্ট করুন\n"+
"╰━━━━━━━━━━━━━━━━━╯",

      fileWillDelete:
"\n│ 🗑️ মুছে ফেলার ফাইল\n%1",

      andMore:
"\n│ ...আরও %1টি ফাইল",

      updateConfirmed:
"╭━━━━━━━━━━━━━━━━━━╮\n"+
"│ 🚀 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯\n"+
"├━━━━━━━━━━━━━━━━━━┤\n"+
"│ ⏳ বট আপডেট হচ্ছে...\n"+
"│ 🔧 অনুগ্রহ করে অপেক্ষা করুন\n"+
"╰━━━━━━━━━━━━━━━━━━╯",

      updateComplete:
"╭━━━━━━━━━━━━━━━━━━╮\n"+
"│ 🚀 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧 𝗩𝟯\n"+
"├━━━━━━━━━━━━━━━━━━┤\n"+
"│ ✅ আপডেট সম্পূর্ণ\n"+
"│ 🔄 এখন রিস্টার্ট করবেন?\n"+
"│ 💬 উত্তর দিন : yes / y\n"+
"╰━━━━━━━━━━━━━━━━━━╯",

      updateTooFast:
"⚠️ খুব দ্রুত আপডেট!\n⏳ অপেক্ষা করুন %3মি %4সে",

      botWillRestart:
"🔄 বট রিস্টার্ট হচ্ছে..."
    }
  },

  onLoad: async function ({ api }) {
    try {
      if (fs.existsSync(dirBootLogTemp)) {
        const threadID = fs.readFileSync(dirBootLogTemp, "utf8");
        fs.removeSync(dirBootLogTemp);
        api.sendMessage("✅ Bot Restarted!", threadID);
      }
    } catch (e) {}
  },

  onStart: async function ({ message, getLang, event, commandName }) {

    const { data: packageData } = await axios.get(
      "https://raw.githubusercontent.com/ncazad/X69X-BOT-V3/main/package.json"
    );

    const { data: versions } = await axios.get(
      "https://raw.githubusercontent.com/ncazad/X69X-BOT-V3/main/version.json"
    );

    const currentVersion = require("../../package.json").version;

    if (compareVersion(packageData.version, currentVersion) < 1) {

      const { date, time } = getBangladeshTime();
      const stats = getPerformanceStats();

      return message.reply(
        getLang(
          "noUpdates",
          currentVersion,
          date,
          time,
          stats.performance,
          stats.memory,
          stats.cpu,
          stats.uptime
        )
      );
    }

    message.reply(
      getLang(
        "updatePrompt",
        currentVersion,
        packageData.version,
        "│ • Core Files\n│ • Commands\n",
        ""
      ),
      (err, info) => {

        global.GoatBot.onReaction.set(info.messageID, {
          messageID: info.messageID,
          threadID: info.threadID,
          authorID: event.senderID,
          commandName
        });

      }
    );
  },

  onReaction: async function ({ message, Reaction, event }) {

    if (event.userID != Reaction.authorID) return;

    const { data: lastCommit } = await axios.get(
      "https://api.github.com/repos/ncazad/X69X-BOT-V3/commits/main"
    );

    await message.reply(getLang("updateConfirmed"));

    execSync(
      "git pull https://github.com/ncazad/X69X-BOT-V3.git main",
      { stdio: "inherit", cwd: path.join(__dirname, "..", "..") }
    );

    fs.writeFileSync(dirBootLogTemp, event.threadID);

    const { date, time } = getBangladeshTime();
    message.reply(
      getLang("updateComplete") + `\n📅 ${date}\n⏰ ${time}`
    );
  },

  onReply: async function ({ message, event, getLang }) {

    const body = event.body?.toLowerCase();

    if (body === "yes" || body === "y") {

      message.reply(getLang("botWillRestart"));

      setTimeout(() => {
        process.exit(2);
      }, 2000);

    }
  }
};

function compareVersion(v1, v2) {
  const a = v1.split(".");
  const b = v2.split(".");

  for (let i = 0; i < 3; i++) {
    const n1 = parseInt(a[i]) || 0;
    const n2 = parseInt(b[i]) || 0;

    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }

  return 0;
}

function getBangladeshTime() {
  try {
    const now = new Date();
    
    const date = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Dhaka'
    }).format(now);
    
    const time = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka'
    }).format(now);

    return { date, time };
  } catch (error) {
    const now = new Date();
    
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bdTime = new Date(utc + (3600000 * 6));
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = bdTime.getDate().toString().padStart(2, '0');
    const month = months[bdTime.getMonth()];
    const year = bdTime.getFullYear();
    const date = `${day} ${month} ${year}`;
    
    let hours = bdTime.getHours();
    const minutes = bdTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const time = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    
    return { date, time };
  }
}

function getPerformanceStats() {
  const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const totalMemory = os.totalmem() / 1024 / 1024;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  const cpu = os.loadavg()[0].toFixed(1);
  const uptime = formatUptime(process.uptime());
  
  let performance = "Excellent ✅";
  if (memoryUsage > 80 || cpu > 70) {
    performance = "Moderate ⚠️";
  }
  if (memoryUsage > 90 || cpu > 85) {
    performance = "Critical 🔴";
  }

  return {
    performance: performance,
    memory: `${usedMemory.toFixed(1)}MB (${memoryUsage.toFixed(1)}%)`,
    cpu: `${cpu}%`,
    uptime: uptime
  };
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let uptimeString = '';
  if (days > 0) uptimeString += `${days}d `;
  if (hours > 0) uptimeString += `${hours}h `;
  uptimeString += `${minutes}m`;
  
  return uptimeString;
}
