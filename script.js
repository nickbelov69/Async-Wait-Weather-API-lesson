

async function getWeather(url) {
    const response = await fetch(url);
    console.log(response);
    const json = await response.json();
    console.log(json);
    return json;

}
getWeather("https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/London,UK?key=CG5WK669S3NTUD94YYQ4L46P2"
)