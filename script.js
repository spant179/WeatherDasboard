const apiKey = "d6b567212be127674efd893bb00d1419";
var cityHistory;
var currWeather = $("#currentWeather");
var fiveDayForecast = $("#weatherForecast");


$("#submitCity").click(function() {
    event.preventDefault();
    let cityName = $("#cityName").val();
    getWeatherDetails(cityName);
    getFutureWeather(cityName);
});

$("#pastCities").click(function() {
    let cityName = event.target.value;
    getWeatherDetails(cityName);
    getFutureWeather(cityName);
})

if (localStorage.getItem("localWeatherSearches")) {
    cityHistory = JSON.parse(localStorage.getItem("localWeatherSearches"));
    writeSearchHistory(cityHistory);
} else {
    cityHistory = [];
};

$("#clear").click(function() {
    localStorage.clear('localWeatherSearches');
});

function getWeatherDetails(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&APPID=${apiKey}`;

      $.ajax({
          url: queryURL,
          type: 'GET',
          success: function(response){
      
        let currTime = new Date(response.dt*1000);
        let weatherIcon = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;
        currWeather.html(`
        <h2>${response.name}, ${response.sys.country} (${currTime.getMonth()+1}/${currTime.getDate()}/${currTime.getFullYear()})<img src=${weatherIcon} height="70px"></h2>
        <p>Temperature: ${response.main.temp}°F</p>
        <p>Humidity: ${response.main.humidity}%</p>
        <p>Wind Speed: ${response.wind.speed} mph</p>
        `, returnUVIndex(response.coord))
        historyCities(response.name);
          },
          error: function(){
              console.clear();
              alert('Please enter valid city!');
              console.clear();
          }
        })
};

function getFutureWeather(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&APPID=${apiKey}`;

    $.get(queryURL).then(function(response){
        let forecastInfo = response.list;
        fiveDayForecast.empty();
        $.each(forecastInfo, function(i) {
            if (!forecastInfo[i].dt_txt.includes("12:00:00")) {
                return;
            }
            let forecastDate = new Date(forecastInfo[i].dt*1000); 
            let weatherIcon = `https://openweathermap.org/img/wn/${forecastInfo[i].weather[0].icon}.png`;
            fiveDayForecast.append(`
            <div class="col-md">
                <div class="card text-white bg-primary">
                    <div class="card-body">
                        <h4>${forecastDate.getMonth()+1}/${forecastDate.getDate()}/${forecastDate.getFullYear()}</h4>
                        <img src=${weatherIcon} alt="Icon">
                        <p>Temp: ${forecastInfo[i].main.temp}°F</p>
                        <p>Humidity: ${forecastInfo[i].main.humidity}%</p>
                    </div>
                </div>
            </div>
            `)
        })
    })
};

function returnUVIndex(coordinates) {
    let queryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${coordinates.lat}&lon=${coordinates.lon}&APPID=${apiKey}`;

    $.get(queryURL).then(function(response){
        let UV = response.value;
        let UVcolor = "green";

        if(UV >= 11){
            UVcolor = "violet";
        } else if (UV >= 8){
            UVcolor = "red";
        } else if (UV >= 6){
            UVcolor = "orange";
        } else if (UV >= 3){
            UVcolor = "yellow";
        }
        currWeather.append(`<p>UV Index: <span class="blockUV" style="background-color: ${UVcolor}">${UV}</span></p>`);
    })
}

function historyCities(cityName) {
    var citySearch = cityName.trim();
    var buttonCheck = $(`#pastCities > BUTTON[value='${citySearch}']`);
    if (buttonCheck.length == 1) {
      return;
    }
    
    if (!cityHistory.includes(cityName)){
        cityHistory.push(cityName);
        localStorage.setItem("localWeatherSearches", JSON.stringify(cityHistory));
    }

    $("#pastCities").prepend(`
    <button class="btn btn-light cityHistoryBtn" value='${cityName}'>${cityName}</button>
    `);
}

function writeSearchHistory(array) {
    $.each(array, function(i) {
        historyCities(array[i]);
    })
}