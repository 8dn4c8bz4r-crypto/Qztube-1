const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const VIDEO_DIR = path.join(DATA_DIR, "videos");
const META_FILE = path.join(DATA_DIR, "videos.json");

fs.mkdirSync(VIDEO_DIR, { recursive: true });
if (!fs.existsSync(META_FILE)) fs.writeFileSync(META_FILE, "[]");

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/videos", express.static(VIDEO_DIR));

function readVideos() {
  try { return JSON.parse(fs.readFileSync(META_FILE, "utf8")); }
  catch { return []; }
}

app.get("/api/videos", (req, res) => res.json(readVideos()));

app.post("/api/videos", (req, res) => {
  const { title, url, description = "", type = "video" } = req.body || {};
  if (!title || !url) return res.status(400).json({ error: "Атауы мен видео сілтемесі қажет." });
  const videos = readVideos();
  const item = {
    id: Date.now().toString(),
    title: String(title).slice(0, 120),
    url: String(url),
    description: String(description).slice(0, 500),
    type: type === "short" ? "short" : "video",
    createdAt: new Date().toISOString()
  };
  videos.unshift(item);
  fs.writeFileSync(META_FILE, JSON.stringify(videos, null, 2));
  res.status(201).json(item);
});

app.delete("/api/videos/:id", (req, res) => {
  const videos = readVideos();
  const next = videos.filter(v => v.id !== req.params.id);
  fs.writeFileSync(META_FILE, JSON.stringify(next, null, 2));
  res.json({ ok: true });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`QazaqTube running on port ${PORT}`);
});
