const KEY = "a6d33c42c42f7cd7aa93a115a6ac6fe0";
const monitor = document.getElementById("runtime-console");
const btn = document.getElementById("triggerSearch");
// Function to push logs to our custom UI console
const updateMonitor = (content, category) => {
  const entry = document.createElement("div");
  entry.className = `log-entry type-${category}`;
  entry.innerHTML = `<span>[${new Date().toLocaleTimeString().split(" ")[0]}]</span> ${content}`;
  monitor.appendChild(entry);
  monitor.scrollTop = monitor.scrollHeight;
};

async function executeWeatherCheck(passedCity) {
  const query = passedCity || document.getElementById("userInputCity").value;
  if (!query) return;

  monitor.innerHTML = ""; // Clear for new run
  updateMonitor("INITIATING SYNC BLOCK", "sync");

  // Event Loop Demonstrations
  setTimeout(
    () => updateMonitor("EVENT: Macrotask (setTimeout) triggered", "macro"),
    0,
  );
  Promise.resolve().then(() =>
    updateMonitor("EVENT: Microtask (Promise) triggered", "micro"),
  );

  try {
    updateMonitor(`FETCH: Requesting data for ${query}...`, "async");
    const link = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${KEY}`;

    const response = await fetch(link);
    if (!response.ok) throw new Error("Target location unreachable");

    const weatherData = await response.json();
    updateMonitor("SUCCESS: API response parsed", "async");

    // UI Refresh
    document.getElementById("res-city").innerText =
      `${weatherData.name}, ${weatherData.sys.country}`;
    document.getElementById("res-temp").innerText =
      `${Math.round(weatherData.main.temp)}°C`;
    document.getElementById("res-cond").innerText =
      weatherData.weather[0].description.toUpperCase();
    document.getElementById("res-hum").innerText =
      `${weatherData.main.humidity}%`;
    document.getElementById("res-wind").innerText =
      `${weatherData.wind.speed} m/s`;

    handleHistoryData(query);
  } catch (e) {
    updateMonitor(`FAIL: ${e.message}`, "async");
    alert("Error: " + e.message);
  }

  updateMonitor("SYNC BLOCK COMPLETE", "sync");
}

function handleHistoryData(name) {
  let saved = JSON.parse(localStorage.getItem("lab2_cache")) || [];
  if (!saved.includes(name)) {
    saved = [name, ...saved].slice(0, 5); // Add to start and limit to 5
    localStorage.setItem("lab2_cache", JSON.stringify(saved));
    refreshHistoryUI();
  }
}

function refreshHistoryUI() {
  const shelf = document.getElementById("historyContainer");
  const stored = JSON.parse(localStorage.getItem("lab2_cache")) || [];
  shelf.innerHTML = "";

  stored.forEach((item) => {
    const tag = document.createElement("button");
    tag.style.cssText =
      "margin: 5px; padding: 5px 10px; cursor: pointer; background: #222; color: #eee; border: 1px solid #444; border-radius: 4px;";
    tag.innerText = item;
    tag.onclick = () => executeWeatherCheck(item);
    shelf.appendChild(tag);
  });
}

// Event Listeners
btn.addEventListener("click", () => executeWeatherCheck());
window.onload = refreshHistoryUI;