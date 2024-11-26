
var placeWeatherData = {};
initWeatherApp();

function initWeatherApp(){
    getPlaceWeather();
    var placeNameInput = document.getElementById("placeNameInput");

    // Execute a function when the user presses a key on the keyboard
    placeNameInput.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        getPlaceWeather();
    }
    });
}


async function getPlaceWeather() {
    //If there is an input
    if(document.getElementById("placeNameInput").value){
        try{
            await fetchPlaceCoordsByName();
            await fetchWeatherByCoords(placeWeatherData.lat,placeWeatherData.lon);
        }catch(error){
            console.log(error);
        }
    //Else load current location weather
    }else{
        await fetchPlaceNameByCoords();
        await fetchWeatherByCoords(placeWeatherData.lat,placeWeatherData.lon);
    }
    displayWeatherData();
    
}

async function fetchWeatherByCoords(lat, lon) {
    try{
        //fetch data from api
        const weatherResponse =  await fetch("https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+"&current=apparent_temperature,is_day,precipitation_probability,rain,snowfall,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high");
        if(!weatherResponse.ok){ throw new Error("Error consulting "+placeWeatherData.city+"'s weather");}
        const weatherData = await weatherResponse.json();
        
        //Store values in our object
        placeWeatherData.temperature = weatherData.current.apparent_temperature;
        placeWeatherData.precipitationProbability = weatherData.current.precipitation_probability;
        placeWeatherData.isDayTime = weatherData.current.is_day;
        placeWeatherData.isRaining = weatherData.current.rain;
        placeWeatherData.isSnowing = weatherData.current.snowfall;

        //Change cloudiness depending on how cloudy it is. If day time it's sunny, if it's nighttime it's clear.
        placeWeatherData.cloudiness = placeWeatherData.isDayTime == 1 ? "sunny" : "clear";
        if(weatherData.current.cloud_cover_high > 0) {
            placeWeatherData.cloudiness = "very cloudy";
            return;
        }
        if(weatherData.current.cloud_cover_mid > 0) {
            placeWeatherData.cloudiness = "cloudy";
            return;   
        }
        if(weatherData.current.cloud_cover_low > 0) {
            placeWeatherData.cloudiness = "a little cloudy";
            return;
        }
        if(weatherData.current.cloud_cover > 0) {
            placeWeatherData.cloudiness += "clear with a few clouds";
            return;
        }
    }catch(error){
        console.log(error);
    }
    
}

async function fetchPlaceNameByCoords(){
    //Create a promise to return fetched data.
    return new Promise((resolve, reject) => {

        //If the navigator has geolocation, we can access user's current location.
        if (navigator.geolocation) {

            //Get geolocation and store it in our data object.
            navigator.geolocation.getCurrentPosition(async function(position) {
            placeWeatherData.lat = position.coords.latitude;
            placeWeatherData.lon = position.coords.longitude;

            //Try to fetch our coord's address to get more data and transform it to a json format.
            try{
                const placeResponse = await fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${placeWeatherData.lat}&lon=${placeWeatherData.lon}&zoom=18&format=jsonv2`);
                if(!placeResponse.ok){throw new Error("error locating longitude and latitude");}
                const placeData = await placeResponse.json();

                //Storing values in our object.
                placeWeatherData.city = placeData.address.city;
                placeWeatherData.state = placeData.address.state;
                placeWeatherData.country = placeData.address.country;

                resolve();

            //If fetching failed, catches error.
            }catch(error){
                reject(error);
            }
        });

        //Else the navigator cannot get user's coords and rejects.
        }else{
            reject(error);
        }
    });    
}

async function fetchPlaceCoordsByName(){
    
    //Get place name value from input.
    const placeNameInput = document.getElementById("placeNameInput").value.toLowerCase();
    try{
        //Fetch place data using name query.
        const placeResponse = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${placeNameInput}&limit=1&format=jsonv2&addressdetails=1`);

        //If response fails, throw new error.
        if(!placeResponse.ok){ throw new Error("Couldn't find "+placeNameInput); }

        //Else, we await response and store data in our variable.
        const placeData = await placeResponse.json();
        placeWeatherData.city = placeData[0].address.city;
        placeWeatherData.state = placeData[0].address.state;
        placeWeatherData.country = placeData[0].address.country;
        placeWeatherData.lat = placeData[0].lat;
        placeWeatherData.lon = placeData[0].lon;
    }catch(error){
        console.log(error);
    }

}

function displayWeatherData(){

    const weatherIcon = document.getElementById("weatherIcon");
    const weatherTemperature = document.getElementById("weatherTemperature");
    const weatherPlace = document.getElementById("weatherPlace");
    const weatherDescription = document.getElementById("weatherDescription");
    const weatherTimeIcon = document.getElementById("weatherTimeIcon");
    const weatherTime = document.getElementById("weatherTime");
    const weatherFeelIcon = document.getElementById("weatherFeelIcon");
    const weatherFeel = document.getElementById("weatherFeel");
    const precipitationChances = document.getElementById("precipitationChances");

    //choose weather icon
    var weatherIconUrl = getWeatherIconUrl();
    var temperatureNumber = placeWeatherData.temperature + "° C";
    var fullPlace = getPlaceName();
    var place = fullPlace.split(", ")[0];
    var description = "The sky is "+placeWeatherData.cloudiness+" today."+(placeWeatherData.isRaining > 0 ? " It's raining." : "")+(placeWeatherData.isSnowing > 0 ? " It's snowing." : "");
    var timeIconUrl = "../assets/"+(placeWeatherData.isDayTime == 1 ? "sunny.svg" : "nightTime.svg");
    var time = (placeWeatherData.isDayTime == 1 ? "It is daytime in " : "The sun is not out yet in ") + place+".";
    var feelIconUrl = "../assets/"+(placeWeatherData.temperature < 0 ? "thermometerMinus.svg" : "thermometer.svg");
    var feel = "The weather feels "+getWeatherFeel()+" in "+place+".";
    var precipitation =  placeWeatherData.precipitationProbability+"% probability of precipitation."

    weatherIcon.style.maskImage = "url('"+weatherIconUrl+"')";
    weatherTemperature.innerHTML = temperatureNumber;
    weatherPlace.innerHTML = fullPlace;
    weatherDescription.innerHTML = description;
    weatherTimeIcon.style.maskImage = "url('"+timeIconUrl+"')";
    weatherTime.innerHTML = time;
    weatherFeelIcon.style.maskImage = "url('"+feelIconUrl+"')";
    weatherFeel.innerHTML = feel;
    precipitationChances.innerHTML = precipitation;
    updateAppTheme();

}

function getPlaceName(){
    var place = [placeWeatherData.city,placeWeatherData.state,placeWeatherData.country];
    var placeName="";
    place.forEach((e) => {
        if(e != undefined){
            placeName += e+", ";
        }
    })
    placeName = placeName.slice(0,-2);
    return placeName;
}

function getWeatherFeel(){
    if(placeWeatherData.temperature < 0){
        return "very cold";
    }
    if(placeWeatherData.temperature < 10){
        return "cold";
    }
    if(placeWeatherData.temperature < 20){
        return "chilly";
    }
    if(placeWeatherData.temperature < 30){
        return "warm";
    }
    return "hot"
}

function getWeatherIconUrl(){
    var url = "../assets/";
    if(placeWeatherData.cloudiness.includes("clear")){
        return url+(placeWeatherData.isDayTime == 1 ? "sunny.svg" : "nightTime.svg");
    }
    if(placeWeatherData.isRaining > 0){
        return url+(placeWeatherData.cloudiness.includes("very cloudy") ? "storm.svg":"rainy.svg");
    }
    if(placeWeatherData.isSnowing > 0){
        return url+"snowy.svg";
    }
    return url+(placeWeatherData.isDayTime == 1 ? "sunnyCloudy.svg" : "cloudyNight.svg");
    
    
}

function updateAppTheme(){
    const cardContainer = document.getElementById("cardContainer");
    const searchButtonSvg = document.getElementById("searchButtonSvg");
    const weatherDataContainer = document.getElementById("weatherDataContainer");
    const weatherIcons = document.querySelectorAll(".weatherIcon");
    
    if(placeWeatherData.isDayTime == 1){
        cardContainer.style.backgroundColor = "var(--dayAccentColor)";
        searchButtonSvg.style.fill = "var(--dayAccentColor)";
        weatherDataContainer.style.backgroundImage = "none";
        weatherDataContainer.backgroundColor = "var(--dayBackground)";
        weatherIcons.forEach( (icon) => {
            icon.style.backgroundColor = "var(--dayAccentColor)";
        })
        document.querySelector("body").style.color = "black";


    }else{
        cardContainer.style.backgroundColor = "var(--nightAccentColor)";
        searchButtonSvg.style.fill = "var(--nightAccentColor)";
        weatherDataContainer.style.backgroundImage = "var(--nightGradient)";
        weatherIcons.forEach( (icon) => {
            icon.style.backgroundColor = "white";
        })
        document.querySelector("body").style.color = "white";

    }
}