import "./styles.css";

const API_KEY = "CG5WK669S3NTUD94YYQ4L46P2";

const input = document.querySelector("#input");
const form = document.querySelector("form");
const suggestions = document.querySelector("#suggestions");

const locationElement = document.querySelector("#location");
const temperatureElement = document.querySelector("#temperature");
const feelslikeElement = document.querySelector("#feelslike");
const humidityElement = document.querySelector("#humidity");
const windspeedElement = document.querySelector("#windspeed");
const conditionElement = document.querySelector("#condition");
const iconElement = document.querySelector("#icon");

const backgroundControls =
    document.querySelector("#background-controls");

const unitToggle =
    document.querySelector("#unit-toggle");

const background =
    document.querySelector("#weather-bg");

let weather = null;
let autocompleteTimer = null;
let autocompleteController = null;

const weatherIcons = {
    "clear-day": "🌞",
    "clear-night": "🌚",
    "partly-cloudy-day": "🌥️",
    "partly-cloudy-night": "🌓",
    cloudy: "☁️",
    rain: "🌧️",
    snow: "❄️",
    fog: "🌫️",
    wind: "🌬️"
};

function fahrenheitToCelsius(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5 / 9);
}

function getTemperatureValue(fahrenheit) {
    return unitToggle.checked
        ? `${fahrenheitToCelsius(fahrenheit)}°C`
        : `${fahrenheit}°F`;
}

function setTemperatureColor(fahrenheit) {
    const celsius = fahrenheitToCelsius(fahrenheit);

    if (celsius <= 0) {
        temperatureElement.style.color = "#3b82f6";
    } else if (celsius <= 10) {
        temperatureElement.style.color = "#0a9396";
    } else if (celsius <= 20) {
        temperatureElement.style.color = "#94d2bd";
    } else if (celsius <= 30) {
        temperatureElement.style.color = "#b86018";
    } else {
        temperatureElement.style.color = "#9b2226";
    }
}

function setWeatherBackground(icon) {
    background.className = icon;

    background
        .querySelectorAll(".weather-layer")
        .forEach((layer) => {
            layer.classList.remove("active");
        });

    const activeLayer =
        background.querySelector(`.weather-layer.${icon}`);

    if (activeLayer) {
        activeLayer.classList.add("active");
    }
}

async function getSuggestions(query) {
    if (autocompleteController) {
        autocompleteController.abort();
    }

    autocompleteController = new AbortController();

    const url =
        "https://geocoding-api.open-meteo.com/v1/search?" +
        `name=${encodeURIComponent(query)}` +
        "&count=5" +
        "&language=en" +
        "&format=json";

    const response = await fetch(url, {
        signal: autocompleteController.signal
    });

    if (!response.ok) {
        throw new Error("Autocomplete request failed");
    }

    return response.json();
}

function renderSuggestions(results) {
    suggestions.innerHTML = "";

    if (!results.length) {
        suggestions.classList.remove("visible");
        return;
    }

    results.forEach((place) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "suggestion";

        const locationName = [
            place.name,
            place.admin1,
            place.country
        ]
            .filter(Boolean)
            .join(", ");

        button.textContent = locationName;

        button.addEventListener("click", () => {
            input.value = place.name;

            input.dataset.location = locationName;
            input.dataset.latitude = place.latitude;
            input.dataset.longitude = place.longitude;

            suggestions.innerHTML = "";
            suggestions.classList.remove("visible");
        });

        suggestions.append(button);
    });

    suggestions.classList.add("visible");
}

input.addEventListener("input", () => {
    const query = input.value.trim();

    clearTimeout(autocompleteTimer);

    delete input.dataset.location;
    delete input.dataset.latitude;
    delete input.dataset.longitude;

    if (query.length < 2) {
        suggestions.innerHTML = "";
        suggestions.classList.remove("visible");
        return;
    }

    autocompleteTimer = setTimeout(async () => {
        try {
            const data = await getSuggestions(query);

            renderSuggestions(data.results ?? []);
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error(error);
            }
        }
    }, 0);
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-box")) {
        suggestions.innerHTML = "";
        suggestions.classList.remove("visible");
    }
});

backgroundControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-background]");

    if (!button) {
        return;
    }

    setWeatherBackground(button.dataset.background);
});

unitToggle.addEventListener("change", () => {
    if (!weather) {
        return;
    }

    temperatureElement.textContent =
        getTemperatureValue(weather.temperature);

    feelslikeElement.textContent =
        `Feels like ${getTemperatureValue(weather.feelslike)}`;
});

async function getWeather(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Weather request failed: ${response.status}`);
    }

    return response.json();
}

function getCurrentWeather(json) {
    return {
        location: json.address,
        temperature: json.days[0].temp,
        feelslike: json.days[0].feelslike,
        humidity: json.days[0].humidity,
        windspeed: json.days[0].windspeed,
        condition: json.days[0].conditions,
        icon: json.days[0].icon
    };
}

function renderWeather() {
    locationElement.textContent = weather.location;

    temperatureElement.textContent =
        getTemperatureValue(weather.temperature);

    feelslikeElement.textContent =
        `Feels like ${getTemperatureValue(weather.feelslike)}`;

    humidityElement.textContent =
        `${weather.humidity} %`;

    windspeedElement.textContent =
        `${weather.windspeed} km/h`;

    conditionElement.textContent =
        weather.condition;

    iconElement.textContent =
        weatherIcons[weather.icon] || "🌡️";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const typedLocation = input.value.trim();

    if (!typedLocation) {
        return;
    }

    const latitude = input.dataset.latitude;
    const longitude = input.dataset.longitude;

    const location = latitude && longitude
        ? `${latitude},${longitude}`
        : typedLocation;

    const url =
        "https://weather.visualcrossing.com/" +
        "VisualCrossingWebServices/rest/services/timeline/" +
        `${encodeURIComponent(location)}` +
        `?key=${API_KEY}`;

    try {
        const json = await getWeather(url);

        weather = getCurrentWeather(json);

        setWeatherBackground(weather.icon);
        renderWeather();
        setTemperatureColor(weather.temperature);

        backgroundControls.hidden = false;

        delete input.dataset.location;
        delete input.dataset.latitude;
        delete input.dataset.longitude;

    } catch (error) {
        console.error(error);
        locationElement.textContent = "No city found buddy";
    }
});
