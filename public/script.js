async function generateMeme() {
  const prompt = document.getElementById("memePrompt").value;
  const progressBar = document.getElementById("progressBar");
  const progressPercentage = document.getElementById("progressPercentage");
  const memeImage = document.getElementById("generatedMeme");

  if (!prompt.trim()) {
    alert("Please enter a prompt!");
    return;
  }

  memeImage.src = "";
  memeImage.style.display = "none";

  progressBar.style.display = "block";
  progressPercentage.style.display = "block";
  progressBar.value = 0;
  progressPercentage.textContent = "0%";

  const startTime = Date.now();
  let progressValue = 0;
  let progressComplete = false;

  function updateProgress() {
    if (progressValue < 100 && !progressComplete) {
      const elapsedTime = Date.now() - startTime;
      const estimatedTime = 10000;
      progressValue = Math.min((elapsedTime / estimatedTime) * 100, 95);
      progressBar.value = progressValue;
      progressPercentage.textContent = `${Math.round(progressValue)}%`;
      requestAnimationFrame(updateProgress);
    }
  }

  requestAnimationFrame(updateProgress);

  try {
    const response = await fetch("/generate-meme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    progressComplete = true;

    const finishProgress = () => {
      if (progressValue < 100) {
        progressValue += 1;
        progressBar.value = progressValue;
        progressPercentage.textContent = `${Math.round(progressValue)}%`;
        requestAnimationFrame(finishProgress);
      } else {
        progressBar.style.display = "none";
        progressPercentage.style.display = "none";
      }
    };

    requestAnimationFrame(finishProgress);

    if (data.success) {
      memeImage.src = data.imageUrl;
      memeImage.style.display = "block";
    } else {
      alert("Failed to generate the image. Try again later.");
      progressBar.style.display = "none";
      progressPercentage.style.display = "none";
    }
  } catch (error) {
    progressComplete = true;
    console.error("Error:", error);
    alert("An error occurred while generating the image.");
    progressBar.style.display = "none";
    progressPercentage.style.display = "none";
  }
}

async function copyImageToClipboard() {
  const memeImage = document.getElementById("generatedMeme");

  if (!memeImage.src || memeImage.complete === false) {
    alert("No image available to copy or still loading!");
    return;
  }

  try {
    const response = await fetch(memeImage.src);
    if (!response.ok) {
      throw new Error("Failed to fetch the image.");
    }

    const blob = await response.blob();

    const clipboardItem = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([clipboardItem]);

    alert("Image copied to clipboard!");
  } catch (error) {
    console.error("Error copying image:", error);
    alert("Failed to copy the image.");
  }
}

async function generateSoundEffect() {
  const soundPrompt = document.getElementById("ttsInput").value;
  const soundPlayer = document.getElementById("soundPlayer");
  const soundSource = document.getElementById("soundSource");
  const audioContainer = document.getElementById("audioContainer");

  if (!soundPrompt.trim()) {
    alert("Please enter a sound description!");
    return;
  }

  try {
    const response = await fetch("/generate-sound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: soundPrompt }),
    });

    const data = await response.json();

    if (data.success) {
      soundSource.src = data.audioUrl;
      soundPlayer.load();
      audioContainer.style.display = "block";
    } else {
      alert("No matching sound effect found.");
    }
  } catch (error) {
    console.error("Error generating sound effect:", error);
    alert("Error generating sound effect.");
  }
}

async function fetchJoke() {
  try {
    const response = await fetch(
      "https://official-joke-api.appspot.com/random_joke"
    );
    const data = await response.json();
    document.getElementById(
      "jokeDisplay"
    ).innerText = `${data.setup} - ${data.punchline}`;
  } catch (error) {
    console.error("Error fetching joke:", error);
    alert("Failed to fetch a joke!");
  }
}

async function generateQuote() {
  try {
    const response = await fetch("/generate-quote", {
      method: "POST",
    });
    const data = await response.json();
    document.getElementById("quoteDisplay").innerText = data.quote;
  } catch (error) {
    console.error("Error generating quote:", error);
    alert("Failed to generate a quote.");
  }
}

function toggleAudio() {
  const audioPlayer = document.getElementById("soundPlayer");
  const playButton = document.getElementById("playButton");
  const timeDisplay = document.getElementById("timeDisplay");

  if (audioPlayer.paused) {
    audioPlayer.play();
    playButton.innerText = "⏸️";
  } else {
    audioPlayer.pause();
    playButton.innerText = "▶️";
  }


  audioPlayer.addEventListener("timeupdate", () => {
    const minutes = Math.floor(audioPlayer.currentTime / 60);
    const seconds = Math.floor(audioPlayer.currentTime % 60)
      .toString()
      .padStart(2, "0");
    timeDisplay.textContent = `${minutes}:${seconds}`;
  });

  audioPlayer.addEventListener("ended", () => {
    playButton.innerText = "▶️";
    timeDisplay.textContent = "0:00";
  });
}
