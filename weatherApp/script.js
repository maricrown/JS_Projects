
var placeWeatherData = {};

//Test
getPlaceWeather();


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
    console.log(placeWeatherData);
    
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
        //Change cloudiness depending on how cloudy it is. If day time it's sunny, if it's nighttime it's clear.
        placeWeatherData.cloudiness = placeWeatherData.isDayTime == 1 ? "Sunny" : "Clear";
        if(weatherData.current.cloud_cover_high > 0) {
            placeWeatherData.cloudiness = "Very cloudy";
            return;
        }
        if(weatherData.current.cloud_cover_mid > 0) {
            placeWeatherData.cloudiness = "Cloudy";
            return;   
        }
        if(weatherData.current.cloud_cover_low > 0) {
            placeWeatherData.cloudiness = "A little cloudy";
            return;
        }
        if(weatherData.current.cloud_cover > 0) {
            placeWeatherData.cloudiness += ", with some clouds in the sky";
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

