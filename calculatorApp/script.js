
var placeWeatherData = {};

//Test
fetchPlaceNameByCoords();

async function fetchWeatherByCoords() {
    const weatherResponse =  await fetch("https://api.open-meteo.com/v1/forecast?latitude="+placeWeatherData.lat+"&longitude="+placeWeatherData.lon+"&current=apparent_temperature,is_day,precipitation_probability,rain,snowfall,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high");
    if(!weatherResponse.ok){ throw new Error("Error consulting "+placeWeatherData.city+"'s weather");}
    const weatherData = await weatherResponse.json();
    placeWeatherData.temperature = weatherData.current.apparent_temperature;
    console.log(weatherData);
}

async function fetchPlaceNameByCoords(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          placeWeatherData.lat = latitude;
          placeWeatherData.lon = longitude;
        try{
            const placeResponse = await fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${placeWeatherData.lat}&lon=${placeWeatherData.lon}&zoom=18&format=jsonv2`);
            if(!placeResponse.ok){throw new Error("error locating longitude and latitude");}
            const placeData = await placeResponse.json();
            placeWeatherData.city = placeData.address.city;
            placeWeatherData.state = placeData.address.state;
            placeWeatherData.country = placeData.address.country;
        }catch(error){
            console.log(error);
        }
    });
    }    
}

async function fetchPlaceCoordsByName(){
    try{
        //Get place name value from input.
        const placeNameInput = document.getElementById("placeNameInput").value.toLowerCase();

        //Fetch place data using name query.
        const placeResponse = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${placeNameInput}&limit=1&layer=address&format=jsonv2`);

        //If response fails, throw new error.
        if(!placeResponse.ok){ throw new Error("Couldn't find "+placeNameInput); }

        //Else, we await response and store data in our variable.
        const placeData = await placeResponse.json();
        var address = placeData[0].display_name.split(", ");
        placeWeatherData.city = address[0];
        placeWeatherData.state = address[2];
        placeWeatherData.country =  address[3];
        placeWeatherData.lat = placeData[0].lat;
        placeWeatherData.lon = placeData[0].lon;
    }catch(error){
        console.log(error);
    }

}

