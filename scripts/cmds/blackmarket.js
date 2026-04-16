const axios = require("axios");

const cmdsInfoUrl = "https://raw.githubusercontent.com/Azadwebapi/Azadx69x-bm-store/main/cmdsinfo.json";
const cmdsUrlJson = "https://raw.githubusercontent.com/Azadwebapi/Azadx69x-bm-store/main/cmdsurl.json";
const fontUrl = "https://raw.githubusercontent.com/Azadwebapi/Azadx69x-bm-store/main/font.json";
const ITEMS_PER_PAGE = 10;

let fontMap = {};

async function loadFont() {
  try {
    const res = await axios.get(fontUrl);
    fontMap = res.data;
  } catch (err) {
    console.error("𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐟𝐨𝐧𝐭.𝐣𝐬𝐨𝐧:", err);
  }
}

function toBold(text) {
  return text.split("").map(ch => fontMap[ch] || ch).join("");
}

module.exports = {
  config: {
    name: "blackmarket",
    aliases: ["bm","cs"],
    version: "1.6",
    author: "Azadx69x",
    role: 0,
    shortDescription: toBold("𝐬𝐡𝐨𝐰 𝐛𝐥𝐚𝐜𝐤𝐦𝐚𝐫𝐤𝐞𝐭 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬"),
    category: toBold("market")
  },

  onStart: async function({ message, args }) {
    try {
      if (Object.keys(fontMap).length === 0) {
        await loadFont();
      }

      const action = args[0]?.toLowerCase();

      if (!action) {  
        return message.reply(
          `${toBold("╔════════════════╗")}
${toBold("║")}  🏴‍☠️ ${toBold("𝐖𝐄𝐋𝐂𝐎𝐌𝐄")} 🏴‍☠️          ${toBold("║")}
${toBold("╚════════════════╝")}

${toBold("𝐓𝐲𝐩𝐞")} 📋 ${toBold("`bm list <𝐩𝐚𝐠𝐞>`")} ${toBold("𝐭𝐨 𝐬𝐞𝐞 𝐚𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬.")}
${toBold("𝐓𝐲𝐩𝐞")} 🔍 ${toBold("`bm show <𝐜𝐨𝐦𝐦𝐚𝐧𝐝>.𝐣𝐬`")} ${toBold("𝐭𝐨 𝐠𝐞𝐭 𝐭𝐡𝐞 𝐫𝐚𝐰 𝐥𝐢𝐧𝐤.")}
${toBold("𝐓𝐲𝐩𝐞")} 🔎 ${toBold("`bm search <𝐧𝐚𝐦𝐞>`")} ${toBold("𝐭𝐨 𝐬𝐞𝐚𝐫𝐜𝐡.")}`
        );  
      }  
      
      const [infoRes, urlRes] = await Promise.all([
        axios.get(cmdsInfoUrl),
        axios.get(cmdsUrlJson)
      ]);

      let cmdsInfo = Array.isArray(infoRes.data) ? infoRes.data : infoRes.data.cmdName || [];
      const cmdsUrls = urlRes?.data || {};

      if (action === "list") {
        if (!cmdsInfo.length) return message.reply(`❌ ${toBold("𝐍𝐨 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐟𝐨𝐮𝐧𝐝!")}`);

        const page = Math.max(1, Number(args[1]) || 1);
        const totalPages = Math.ceil(cmdsInfo.length / ITEMS_PER_PAGE);

        if (page > totalPages) return message.reply(`❌ ${toBold("𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐩𝐚𝐠𝐞 𝐧𝐮𝐦𝐛𝐞𝐫!")} 𝟏-${totalPages}`);

        const start = (page - 1) * ITEMS_PER_PAGE;
        const cmdsPage = cmdsInfo.slice(start, start + ITEMS_PER_PAGE);

        let text = `${toBold("╔════════════════╗")}
${toBold("")}    🏴‍☠️ ${toBold("𝐁𝐋𝐀𝐂𝐊 𝐌𝐀𝐑𝐊𝐄𝐓")} 🏴‍☠️  ${toBold("")}
${toBold("╚════════════════╝")}

`;

        cmdsPage.forEach((c, i) => {
          text += `
${toBold("╭────────────────╮")}
${toBold("│")} 🆔 ${toBold("𝐂𝐨𝐦𝐦𝐚𝐧𝐝")} ${(start + i + 1).toString().split('').map(d => fontMap[d] || d).join('')} ${toBold("")}
${toBold("├────────────────┤")}
${toBold("│ ╭─❯")} 📝 ${toBold("𝐍𝐚𝐦𝐞")}   ${toBold(":")} ${c.cmd}
${toBold("│ ╰─❯")} ⚙️ ${toBold("𝐔𝐩𝐝𝐚𝐭𝐞")} ${toBold(":")} ${c.update}
${toBold("│ ╭─❯")} 👨‍💻 ${toBold("𝐀𝐮𝐭𝐡𝐨𝐫")} ${toBold(":")} ${c.author}
${toBold("╰────────────────╯")}
`;
        });

        text += `\n📊 ${toBold("𝐏𝐚𝐠𝐞")} ${page.toString().split('').map(d => fontMap[d] || d).join('')}/${totalPages.toString().split('').map(d => fontMap[d] || d).join('')}`;
        if (page < totalPages) {
          text += `\n📌 ${toBold("𝐓𝐲𝐩𝐞")} \`bm list ${page + 1}\` ${toBold("𝐟𝐨𝐫 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞")}`;
        }

        return message.reply(text);
      }

      if (action === "show") {
        const cmdName = args[1]?.toLowerCase().endsWith(".js") ? args[1].slice(0, -3) : args[1];
        if (!cmdName) return message.reply(`❌ ${toBold("𝐄𝐱𝐚𝐦𝐩𝐥𝐞")}: bm show chudi.js`);

        const cmd = cmdsInfo.find(c => c.cmd.toLowerCase() === cmdName.toLowerCase());
        const cmdUrl = cmdsUrls?.[cmdName];

        if (!cmd || !cmdUrl) return message.reply(`❌ ${toBold("𝐂𝐨𝐦𝐦𝐚𝐧𝐝")} "${cmdName}" ${toBold("𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!")}`);

        const now = new Date().toLocaleString("en-GB");

        const boxText = `${toBold("╔════════════════╗")}
${toBold("")}     ✅ ${toBold("𝐂𝐌𝐃 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐃")}    ${toBold("")}
${toBold("╚════════════════╝")}

${toBold("┏━━━━━━━━━━━━━━━━┓")}
${toBold("┃")} 📝 ${toBold("𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐍𝐚𝐦𝐞")}
${toBold("┃ ╰─❯")} ${cmdName}
${toBold("┃")} 
${toBold("┃")} 👨‍💻 ${toBold("𝐀𝐮𝐭𝐡𝐨𝐫")}
${toBold("┃ ╰─❯")} ${cmd.author}
${toBold("┃")} 
${toBold("┃")} 📅 ${toBold("𝐔𝐩𝐝𝐚𝐭𝐞𝐝 𝐀𝐭")}
${toBold("┃ ╰─❯")} ${now}
${toBold("┃")} 
${toBold("┃")} ⚡ ${toBold("𝐒𝐭𝐚𝐭𝐮𝐬")}
${toBold("┃ ╰─❯")} ✅ ${toBold("𝐔𝐩𝐥𝐨𝐚𝐝𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲")}
${toBold("┃")} 
${toBold("┃")} 📌 ${toBold("𝐑𝐚𝐰 𝐅𝐢𝐥𝐞 𝐋𝐢𝐧𝐤")}
${toBold("┃ ╰─❯")} ${cmdUrl}
${toBold("┗━━━━━━━━━━━━━━━━┛")}`;

        return message.reply(boxText);
      }

      if (action === "search") {
        const searchQuery = args[1];
        
        if (!searchQuery) {
          return message.reply(`❌ ${toBold("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐞𝐚𝐫𝐜𝐡 𝐭𝐞𝐫𝐦!")}
${toBold("𝐄𝐱𝐚𝐦𝐩𝐥𝐞")}: bm search anisearch`);
        }

        const searchLower = searchQuery.toLowerCase();
        const firstLetter = searchQuery.charAt(0).toLowerCase();
        
        let filteredCmds = cmdsInfo.filter(c => 
          c.cmd.toLowerCase().startsWith(firstLetter)
        );

        if (!filteredCmds.length) {
          return message.reply(`❌ ${toBold("𝐍𝐨 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐟𝐨𝐮𝐧𝐝 𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠 𝐰𝐢𝐭𝐡")} "${searchQuery.charAt(0)}"!`);
        }

        const exactMatch = filteredCmds.find(c => 
          c.cmd.toLowerCase() === searchLower
        );

        const otherCmds = filteredCmds.filter(c => 
          c.cmd.toLowerCase() !== searchLower
        );

        filteredCmds = [];
        if (exactMatch) {
          filteredCmds.push(exactMatch);
        }
        filteredCmds = filteredCmds.concat(otherCmds);

        const page = Math.max(1, Number(args[2]) || 1);
        const totalPages = Math.ceil(filteredCmds.length / ITEMS_PER_PAGE);

        if (page > totalPages) return message.reply(`❌ ${toBold("𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐩𝐚𝐠𝐞 𝐧𝐮𝐦𝐛𝐞𝐫!")} 𝟏-${totalPages}`);

        const start = (page - 1) * ITEMS_PER_PAGE;
        const cmdsPage = filteredCmds.slice(start, start + ITEMS_PER_PAGE);

        let text = `${toBold("╔════════════════╗")}
${toBold("")} 🔍 ${toBold("𝐒𝐄𝐀𝐑𝐂𝐇 𝐑𝐄𝐒𝐔𝐋𝐓𝐒")} 🔍   ${toBold("")}
${toBold("╚════════════════╝")}

${toBold("𝐅𝐨𝐫")}: "${searchQuery}"
${toBold("𝐓𝐨𝐭𝐚𝐥 𝐅𝐨𝐮𝐧𝐝")}: ${filteredCmds.length.toString().split('').map(d => fontMap[d] || d).join('')} ${toBold("𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬")}

`;

        cmdsPage.forEach((c, i) => {
          const isExact = c.cmd.toLowerCase() === searchLower;
          const marker = isExact ? "✅" : "🆔";
          const label = isExact ? toBold("𝐌𝐀𝐓𝐂𝐇") : toBold("𝐂𝐨𝐦𝐦𝐚𝐧𝐝");
          const number = (start + i + 1).toString().split('').map(d => fontMap[d] || d).join('');
          
          text += `
${toBold("╭────────────────╮")}
${toBold("│")} ${marker} ${label} ${number} ${toBold("")}
${toBold("├────────────────┤")}
${toBold("│ ╭─❯")} 📝 ${toBold("𝐍𝐚𝐦𝐞")}   ${toBold(":")} ${c.cmd}
${toBold("│ ╰─❯")} ⚙️ ${toBold("𝐔𝐩𝐝𝐚𝐭𝐞")} ${toBold(":")} ${c.update}
${toBold("│ ╭─❯")} 👨‍💻 ${toBold("𝐀𝐮𝐭𝐡𝐨𝐫")} ${toBold(":")} ${c.author}
${toBold("╰────────────────╯")}
`;
        });

        if (totalPages > 1) {
          text += `\n📊 ${toBold("𝐏𝐚𝐠𝐞")} ${page.toString().split('').map(d => fontMap[d] || d).join('')}/${totalPages.toString().split('').map(d => fontMap[d] || d).join('')}`;
          if (page < totalPages) {
            text += `\n➡️ ${toBold("𝐓𝐲𝐩𝐞")} \`bm search ${searchQuery} ${page + 1}\` ${toBold("𝐟𝐨𝐫 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞")}`;
          }
        }

        return message.reply(text);
      }

      return message.reply(`❌ ${toBold("𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐨𝐩𝐭𝐢𝐨𝐧!")}`);

    } catch (err) {
      return message.reply(`❌ ${toBold("𝐄𝐫𝐫𝐨𝐫")}: ${err.message}`);
    }
  }
};
