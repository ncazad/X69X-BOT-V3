const axios    = require("axios");
const fs       = require("fs");
const os       = require("os");
const path     = require("path");
const { createCanvas, loadImage } = require("canvas");

const API_BASE = "https://azadx69x.is-a.dev";

const W        = 640;
const HEADER_H = 80;
const ROW_H    = 90;
const PADDING  = 20;
const THUMB_W  = 118;
const THUMB_H  = 66;
const FOOT_H   = 20;

function formatViews(n) {
  if (!n || n === 0) return "N/A views";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B views";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M views";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K views";
  return n + " views";
}

function truncate(text, maxLen) {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
}

function drawYTLogo(ctx, x, y) {
  const rw = 36, rh = 26, r = 6;
  ctx.fillStyle = "#FF0000";
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + rw - r, y);
  ctx.quadraticCurveTo(x + rw, y, x + rw, y + r);
  ctx.lineTo(x + rw, y + rh - r);
  ctx.quadraticCurveTo(x + rw, y + rh, x + rw - r, y + rh);
  ctx.lineTo(x + r, y + rh);
  ctx.quadraticCurveTo(x, y + rh, x, y + rh - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  const cx = x + rw / 2 + 2, cy = y + rh / 2;
  ctx.moveTo(cx - 7, cy - 7);
  ctx.lineTo(cx + 9, cy);
  ctx.lineTo(cx - 7, cy + 7);
  ctx.closePath();
  ctx.fill();
}

async function generateSearchImage(results, query, type) {
  const totalH = HEADER_H + results.length * ROW_H + FOOT_H;
  const canvas  = createCanvas(W, totalH);
  const ctx     = canvas.getContext("2d");

  ctx.fillStyle = "#181818";
  ctx.fillRect(0, 0, W, totalH);

  drawYTLogo(ctx, PADDING, 22);

  ctx.fillStyle = "#ffffff";
  ctx.font      = "bold 22px sans-serif";
  ctx.fillText("Search Results", PADDING + 44, 43);

  const typeLabel = type === "audio" ? "Audio" : "Video";
  ctx.fillStyle = "#aaaaaa";
  ctx.font      = "13px sans-serif";
  ctx.fillText(`"${truncate(query, 40)}" — ${typeLabel}`, PADDING + 44, 62);

  ctx.strokeStyle = "#333333";
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, HEADER_H - 1);
  ctx.lineTo(W - PADDING, HEADER_H - 1);
  ctx.stroke();

  for (let i = 0; i < results.length; i++) {
    const r   = results[i];
    const y   = HEADER_H + i * ROW_H;
    const mid = y + ROW_H / 2;

    if (i % 2 === 0) {
      ctx.fillStyle = "#1f1f1f";
      ctx.fillRect(0, y, W, ROW_H);
    }

    ctx.fillStyle = "#666666";
    ctx.font      = "bold 18px sans-serif";
    ctx.fillText(String(r.index), PADDING, mid + 7);

    const thumbX = PADDING + 30;
    const thumbY = y + (ROW_H - THUMB_H) / 2;

    ctx.fillStyle = "#333333";
    ctx.fillRect(thumbX, thumbY, THUMB_W, THUMB_H);

    try {
      const imgBuf = await axios.get(r.thumbnail, { responseType: "arraybuffer", timeout: 6000 });
      const img    = await loadImage(Buffer.from(imgBuf.data));
      ctx.drawImage(img, thumbX, thumbY, THUMB_W, THUMB_H);
    } catch {
      ctx.fillStyle = "#444444";
      ctx.fillRect(thumbX, thumbY, THUMB_W, THUMB_H);
      ctx.fillStyle = "#888888";
      ctx.font      = "11px sans-serif";
      ctx.fillText("No image", thumbX + 28, thumbY + 36);
    }

    ctx.strokeStyle = "#444444";
    ctx.lineWidth   = 1;
    ctx.strokeRect(thumbX, thumbY, THUMB_W, THUMB_H);

    const textX = thumbX + THUMB_W + 14;

    ctx.fillStyle = "#ffffff";
    ctx.font      = "bold 14px sans-serif";
    ctx.fillText(truncate(r.title, 52), textX, mid - 14);

    ctx.fillStyle = "#aaaaaa";
    ctx.font      = "12px sans-serif";
    ctx.fillText(`${truncate(r.channel, 30)} • ${r.duration}`, textX, mid + 4);

    ctx.fillStyle = "#777777";
    ctx.font      = "12px sans-serif";
    ctx.fillText(formatViews(r.views), textX, mid + 20);

    if (i < results.length - 1) {
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(PADDING + 30, y + ROW_H);
      ctx.lineTo(W - PADDING, y + ROW_H);
      ctx.stroke();
    }
  }

  return canvas.toBuffer("image/jpeg", { quality: 0.92 });
}

module.exports = {
  config: {
    name:        "yt",
    version:     "0.0.7",
    author:      "Azadx69x",
    countDown:   5,
    role:        0,
    description: "Search YouTube and download audio or video",
    category:    "media",
    guide:       "{pn} -a <song name>\n{pn} -v <video title>"
  },

  onStart: async function ({ message, args }) {
    const flag = (args[0] || "").toLowerCase();
    if (!flag || !args[1]) {
      return message.reply("Usage:\n-a <song name> → Audio\n-v <title> → Video");
    }

    const type = flag === "-a" ? "audio" : flag === "-v" ? "video" : null;
    if (!type) return message.reply("Use -a for audio or -v for video.");

    const query = args.slice(1).join(" ").trim();
    if (!query) return message.reply("Please provide a search query.");

    try {
      const { data } = await axios.get(
        `${API_BASE}/api/youtube-search?query=${encodeURIComponent(query)}&type=${type}`,
        { timeout: 15000 }
      );

      if (!data.status || !data.results || data.results.length === 0) {
        return message.reply(`No results found for: ${query}`);
      }

      const results = data.results;
      const total   = results.length;

      const imgBuf = await generateSearchImage(results, query, type);
      const tmpImg = path.join(os.tmpdir(), `yt_search_${Date.now()}.jpg`);
      fs.writeFileSync(tmpImg, imgBuf);

      const sentMsg = await message.reply({
        body:       `Reply with 1–${total} to download ${type === "audio" ? "audio 🎵" : "video 🎬"}`,
        attachment: fs.createReadStream(tmpImg)
      });

      setTimeout(() => { try { fs.unlinkSync(tmpImg); } catch (_) {} }, 20000);

      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: "yt",
        messageID:   sentMsg.messageID,
        type,
        results,
        total,
        query
      });

    } catch (err) {
      return message.reply(`Error: ${err.message}`);
    }
  },

  onReply: async function ({ message, event, Reply, api }) {
    if (!Reply || Reply.commandName !== "yt") return;

    const { results, type, total, messageID: searchMsgID } = Reply;
    const choice = parseInt((event.body || "").trim());

    if (isNaN(choice) || choice < 1 || choice > total) {
      return message.reply(`Please reply with a number and ${total}.`);
    }

    const selected = results[choice - 1];
    if (!selected) return message.reply("Invalid selection.");

    global.GoatBot.onReply.delete(searchMsgID);

    try {
      await api.unsendMessage(searchMsgID);
    } catch (_) {}

    const downloadUrl = `${API_BASE}/api/ytdown?url=${encodeURIComponent(selected.url)}&type=${type}`;

    try {
      const { data: dlData } = await axios.get(downloadUrl, {
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });

      if (!dlData.success) throw new Error(dlData.error || "Download API failed");

      const mediaItems = dlData.result?.api?.mediaItems || [];
      if (mediaItems.length === 0) throw new Error("No media items found");

      let picked = null;

      if (type === "audio") {
        picked = mediaItems.find(x => x.type === "Audio" && x.mediaQuality === "128K" && x.mediaExtension === "MP3")
              || mediaItems.find(x => x.type === "Audio" && x.mediaQuality === "128K")
              || mediaItems.find(x => x.type === "Audio")
              || mediaItems.find(x => x.type === "Video" && x.mediaQuality === "HD")
              || mediaItems.find(x => x.type === "Video");
      } else {
        picked = mediaItems.find(x => x.type === "Video" && x.mediaQuality === "HD")
              || mediaItems.find(x => x.type === "Video" && x.mediaQuality === "SD")
              || mediaItems.find(x => x.type === "Video")
              || mediaItems.find(x => x.type === "Audio");
      }

      if (!picked) throw new Error("No suitable media found");

      let fileUrl = picked.mediaPreviewUrl || picked.mediaUrl;
      if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.startsWith("http")) {
        throw new Error("Invalid media URL: " + fileUrl);
      }

      if (picked.mediaUrl && picked.mediaUrl.startsWith("http")) {
        try {
          const workerHeaders = {
            "Accept":     "application/json, text/plain, */*",
            "Referer":    "https://app.ytdown.to/",
            "Origin":     "https://app.ytdown.to",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          };
          let resolvedUrl = null;
          for (let attempt = 0; attempt < 10; attempt++) {
            const workerRes = await axios.get(picked.mediaUrl, { timeout: 20000, headers: workerHeaders });
            const candidate = workerRes.data?.fileUrl;
            if (candidate && candidate !== "Waiting...") {
              resolvedUrl = candidate;
              break;
            }
            await new Promise(r => setTimeout(r, 3000));
          }
          if (resolvedUrl) fileUrl = resolvedUrl;
        } catch (_) {}
      }

      const fileRes = await axios.get(fileUrl, {
        responseType: "arraybuffer",
        timeout:      120000,
        maxRedirects: 10,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer":    "https://www.youtube.com/"
        }
      });

      const ext     = type === "audio" ? "m4a" : "mp4";
      const tmpFile = path.join(os.tmpdir(), `yt_dl_${Date.now()}.${ext}`);
      fs.writeFileSync(tmpFile, Buffer.from(fileRes.data));

      if (!fs.existsSync(tmpFile) || fs.statSync(tmpFile).size === 0) {
        throw new Error("Downloaded file is empty");
      }

      await message.reply({
        attachment: fs.createReadStream(tmpFile)
      });

      setTimeout(() => { try { fs.unlinkSync(tmpFile); } catch (_) {} }, 15000);

    } catch (err) {
      console.error("YT download error:", err.message);
      return message.reply(`Download failed: ${err.message}`);
    }
  }
};
