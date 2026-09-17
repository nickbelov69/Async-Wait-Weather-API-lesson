import "./styles.css";

const input = document.querySelector("#input");
const form = document.querySelector("form");

const locationElement = document.querySelector("#location");
const temperatureElement = document.querySelector("#temperature");
const feelslikeElement = document.querySelector("#feelslike");
const humidityElement = document.querySelector("#humidity");
const windspeedElement = document.querySelector("#windspeed");
const conditionElement = document.querySelector("#condition");
const iconElement = document.querySelector("#icon");
const weatherIcons = {
    "clear-day": "🌞",
    "clear-night": "🌚",
    "partly-cloudy-day": "🌥️",
    "partly-cloudy-night": "🌓",
    "cloudy": "☁️",
    "rain": "🌧️",
    "snow":" ❄️",
    "fog":"🌫️",
    "wind": "🌬️"
}




const unitToggle = document.querySelector("#unit-toggle");

let weather


async function getWeather(url) {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
    return json;
}

function currentWeather (json) {
    return(
        {
            location: json.address,
            temperature: json.days[0].temp,
            feelslike: json.days[0].feelslike,
            humidity: json.days[0].humidity,
            windspeed: json.days[0].windspeed,
            condition: json.days[0].conditions,
            icon: json.days[0].icon
        }

    );
}


function fahrenheitToCelsius(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5 / 9);
}

function setTempColor (temperature) {
    const celsius = fahrenheitToCelsius(temperature);
    if (celsius <=0 ) {
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

unitToggle.addEventListener("change", () =>  {
    temperatureElement.textContent =
        unitToggle.checked
            ?`${fahrenheitToCelsius(weather.temperature)}°C`
            : `${weather.temperature}°F` ;

    feelslikeElement.textContent =
        unitToggle.checked ?
            fahrenheitToCelsius(weather.feelslike) :
            weather.feelslike ;
})

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const location = input.value;
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=CG5WK669S3NTUD94YYQ4L46P2`;

    try {
        const json = await getWeather(url);
        weather =  currentWeather(json)
        setWeatherBackground(weather.icon)
        setTempColor(weather.temperature);

    //       "clear-day": "🌞",
        //     "clear-night": "🌚",
        //     "partly-cloudy-day": "🌥️",
        //     "partly-cloudy-night": "🌓",
        //     "cloudy": "☁️",
        //     "rain": "🌧️",
        //     "snow":" ❄️",
        //     "fog":"🌫️",
        //     "wind": "🌬️"

        locationElement.textContent = weather.location;

        temperatureElement.textContent =
            unitToggle.checked
                ? `${fahrenheitToCelsius(weather.temperature)}°C`
                : `${weather.temperature}°F` ;


        feelslikeElement.textContent =`Feels like
          ${unitToggle.checked ?
            fahrenheitToCelsius(weather.feelslike) :
            weather.feelslike}°F`;


        humidityElement.textContent = `${weather.humidity} %`;
        windspeedElement.textContent = `${weather.windspeed} km/h`;
        conditionElement.textContent = `${weather.condition}`;
        iconElement.textContent = weatherIcons[weather.icon];


    } catch (error) {
        console.log(error);
        locationElement.textContent = "No city found buddy";
    }
})


/* ==== Солнце + градиент по всему экрану ==== */



function updateSunPath() {
    let bg = document.querySelector("#weather-bg");
    const sun = bg.querySelector(".sun");


    const w = window.innerWidth;
    const h = window.innerHeight;

    const startX = -100;
    const endX = w + 100;
    const baseY = h * 0.85;
    const peakY = -h * 0.3;
    const midX = w / 2;

    const path = `M ${startX} ${baseY} Q ${midX} ${peakY} ${endX} ${baseY}`;

    sun.style.offsetPath = `path("${path}")`;
}

updateSunPath();

let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSunPath, 150);
});

function syncGradientAngle() {
    const bg = document.querySelector("#weather-bg");
    const sun = bg.querySelector(".sun");

    function frame() {
        const sunRect = sun.getBoundingClientRect();
        const sunX = sunRect.left + sunRect.width / 2;
        const sunY = sunRect.top + sunRect.height / 2;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const dx = centerX - sunX;
        const dy = centerY - sunY;

        let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        bg.style.setProperty("--sun-angle", `${angle}deg`);

        requestAnimationFrame(frame);
    }

    frame();
}

syncGradientAngle();

function setWeatherBackground(icon) {
    const background = document.querySelector("#weather-bg");

    background.querySelectorAll(".weather-layer").forEach(layer => {
        layer.classList.remove("active");
    })
    const activeLayer = background.querySelector(`.${icon}`);
    if (activeLayer) {
        activeLayer.classList.add("active");
    }
    background.className = icon;
}

