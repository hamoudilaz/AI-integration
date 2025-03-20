import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const PORT = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY;

app.use(express.static("public"));
app.use(express.json());

app.post("/generate-meme", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt.trim()) {
    return res.status(400).json({ error: "Please provide a valid prompt!" });
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    res
      .status(500)
      .json({ error: "Failed to generate image. Try again later." });
  }
});

app.post("/generate-sound", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt.trim()) {
    return res
      .status(400)
      .json({ error: "Please enter a valid sound description." });
  }

  try {
    const response = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(
        prompt
      )}&token=${FREESOUND_API_KEY}`
    );
    const data = await response.json();

    if (data.results.length === 0) {
      return res.status(404).json({ error: "No matching sound found." });
    }

    const soundDetails = await fetch(
      `https://freesound.org/apiv2/sounds/${data.results[0].id}/?token=${FREESOUND_API_KEY}`
    );
    const soundData = await soundDetails.json();

    console.log("Sound URL received:", soundData.previews["preview-hq-mp3"]);

    const soundUrl = soundData.previews["preview-hq-mp3"];
    if (!soundUrl) {
      return res.status(500).json({ error: "Failed to retrieve sound URL." });
    }

    res.json({ success: true, audioUrl: soundUrl });
  } catch (error) {
    console.error("Error generating sound effect:", error);
    res.status(500).json({ error: "Failed to generate sound effect." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
