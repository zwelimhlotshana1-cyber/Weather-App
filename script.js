const weatherCodes = {
  0: ["☀️", "Clear sky"],
  1: ["🌤️", "Mostly clear"],
  2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"],
  45: ["🌫️", "Fog"],
  48: ["🌫️", "Fog"],
  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌦️", "Heavy drizzle"],
  61: ["🌧️", "Light rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy rain"],
  71: ["🌨️", "Light snow"],
  73: ["🌨️", "Snow"],
  75: ["🌨️", "Heavy snow"],
  80: ["🌦️", "Rain showers"],
  81: ["🌦️", "Rain showers"],
  82: ["⛈️", "Heavy showers"],
  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm with hail"],
  99: ["⛈️", "Thunderstorm with hail"],
};

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const result = document.getElementById("result");

function getWeatherInfo(code) {
  return weatherCodes[code] || ["🌡️", "Unknown"];
}

// Step 1: turn the city name into latitude and longitude
async function findCity(name) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&name=" +
    encodeURIComponent(name);
  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return null;
  }
  return data.results[0];
}

// Step 2: ask for the weather at that place
async function getWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" +
    lat +
    "&longitude=" +
    lon +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&timezone=auto";
  const response = await fetch(url);
  return await response.json();
}

async function search() {
  const name = cityInput.value.trim();
  if (name === "") {
    message.textContent = "Please type a city name first.";
    return;
  }

  message.textContent = "Loading...";
  result.classList.add("hidden");

  try {
    const place = await findCity(name);
    if (place === null) {
      message.textContent = "City not found. Check the spelling and try again.";
      return;
    }

    const weather = await getWeather(place.latitude, place.longitude);
    showWeather(place, weather);
    message.textContent = "";
  } catch (error) {
    console.log(error);
    message.textContent = "Error: " + error.message;
  }
}

function showWeather(place, weather) {
  const now = weather.current;
  const info = getWeatherInfo(now.weather_code);

  document.getElementById("icon").textContent = info[0];
  document.getElementById("temp").textContent =
    Math.round(now.temperature_2m) + "°C";
  document.getElementById("city").textContent =
    place.name + ", " + place.country;
  document.getElementById("desc").textContent = info[1];
  document.getElementById("feels").textContent =
    Math.round(now.apparent_temperature) + "°C";
  document.getElementById("humidity").textContent =
    now.relative_humidity_2m + "%";
  document.getElementById("wind").textContent =
    Math.round(now.wind_speed_10m) + " km/h";

  // 5-day forecast
  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const date = new Date(weather.daily.time[i] + "T00:00:00");
    const dayName = date.toLocaleDateString("en-ZA", { weekday: "short" });
    const dayInfo = getWeatherInfo(weather.daily.weather_code[i]);
    const high = Math.round(weather.daily.temperature_2m_max[i]);
    const low = Math.round(weather.daily.temperature_2m_min[i]);

    forecastEl.innerHTML += `
          <div class="day">
            <div>${dayName}</div>
            <div class="small-icon">${dayInfo[0]}</div>
            <div>${high}°</div>
            <div>${low}°</div>
          </div>
        `;
  }

  result.classList.remove("hidden");
}

searchBtn.addEventListener("click", search);
cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") search();
});
