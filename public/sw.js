

const express = require("express");

const path = require("path");

const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");

const VIDEO_FILE = path.join(DATA_DIR, "videos.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

const footballVideos = [

  {

    id: "football-1",

    title: "Cristiano Ronaldo — Football Highlights",

    description: "Роналду туралы футбол видеосы",

    url: "https://www.youtube.com/watch?v=8ybW48rKBME",

    type: "video",

    category: "Роналду"

  },

  {

    id: "football-2",

    title: "Lionel Messi — Football Highlights",

    description: "Мессидің футбол сәттері",

    url: "https://www.youtube.com/watch?v=7w1k7m9vQ4",

    type: "video",

    category: "Месси"

  },

  {

    id: "football-3",

    title: "Champions League",

    description: "Чемпиондар лигасы",

    url: "https://www.youtube.com/results?search_query=champions+league+highlights",

    type: "video",

    category: "UCL"

  },

  {

    id: "football-4",

    title: "Real Madrid",

    description: "Реал Мадрид футбол видеолары",

    url: "https://www.youtube.com/results?search_query=real+madrid+highlights",

    type: "video",

    category: "Реал Мадрид"

  },

  {

    id: "football-5",

    title: "Barcelona",

    description: "Барселона футбол видеолары",

    url: "https://www.youtube.com/results?search_query=barcelona+highlights",

    type: "video",

    category: "Барселона"

  },

  {

    id: "football-6",

    title: "Football Shorts",

    description: "Қысқа футбол видеолары",

    url: "https://www.youtube.com/results?search_query=football+shorts",

    type: "short",

    category: "Shorts"

  },

  {

    id: "football-7",

    title: "Қазақстан футболы",

    description: "Қазақстан футбол жаңалықтары мен сәттері",

    url: "https://www.youtube.com/results?search_query=kazakhstan+football",

    type: "video",

    category: "Қазақстан"

  }

];

if (!fs.existsSync(VIDEO_FILE)) {

  fs.writeFileSync(

    VIDEO_FILE,

    JSON.stringify(footballVideos, null, 2)

  );

}

app.use(express.json({ limit: "2mb" }));

app.use(express.static(path.join(__dirname, "public")));

function getVideos() {

  try {

    return JSON.parse(fs.readFileSync(VIDEO_FILE, "utf8"));

  } catch {

    return footballVideos;

  }

}

app.get("/api/videos", (req, res) => {

  res.json(getVideos());

});

app.get("/api/categories", (req, res) => {

  res.json([

    "Барлығы",

    "Роналду",

    "Месси",

    "Реал Мадрид",

    "Барселона",

    "UCL",

    "Қазақстан",

    "Shorts"

  ]);

});

app.post("/api/videos", (req, res) => {

  const { title, url, description, type, category } = req.body;

  if (!title || !url) {

    return res.status(400).json({

      error: "Видео атауы мен сілтемесі қажет"

    });

  }

  const videos = getVideos();

  const video = {

    id: Date.now().toString(),

    title,

    url,

    description: description || "",

    type: type === "short" ? "short" : "video",

    category: category || "Басқа"

  };

  videos.unshift(video);

  fs.writeFileSync(

    VIDEO_FILE,

    JSON.stringify(videos, null, 2)

  );

  res.status(201).json(video);

});

app.get("*", (req, res) => {

  res.sendFile(

    path.join(__dirname, "public", "index.html")

  );

});

app.listen(PORT, "0.0.0.0", () => {

  console.log("QazaqTube football server started on port " + PORT);

});
