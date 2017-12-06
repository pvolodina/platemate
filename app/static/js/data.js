$(document).ready(function() {

    var params = {
        "latitude" : 0,
        "longitude" : 0,
        "range" : 0,
        "categories" : "",
        "price" : 0,
        //"ratings" : 0,
        "city": ""
    }


    var notify = document.getElementById("notify");
    var button = document.getElementById("getLocation");
    var findMe = document.getElementById("findMe");
    var form = document.getElementById("zipform");


    $(button).mouseup(function(){
        $(this).blur();
    });

    // calls google maps API to access device location
    // DOESN'T WORK IN SAFARI - USE CHROME
    findMe.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                params.latitude = position.coords.latitude;
                params.longitude = position.coords.longitude;
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // retrieves the zip code of current location
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'location': pos}, function(results, status) {
                    var zipcode_api;
                    for (var x = 0, length_1 = results.length; x < length_1; x++) {
                        for (var y = 0, length_2 = results[x].address_components.length; y < length_2; y++) {
                            var type = results[x].address_components[y].types[0];
                            if ( type === "postal_code") {
                                zipcode_api = results[x].address_components[y].long_name;
                                break;
                            }
                        }
                    }

                    // displays zip code of current location in form input box
                    form.value = zipcode_api;

                    // helper function to get city name, also called for "submit" option
                    getCityName(results, status, "your current location");
                });
            });
        } else {
            notify.innerHTML="Geolocation is not available, please enter your zipcode manually.";
        }
    });



    // Gets the element for the zipcode input and checks that it's a valid zip code by input
    // If incorrect, doesn't move on to the next question until it's valid
    button.addEventListener('click', function() {
        var zipcode = form.value;
        if (validateZipcode(zipcode)) {
            notify.innerHTML="";
            var geocoder = new google.maps.Geocoder();
            var cityName;
            geocoder.geocode({ 'address': zipcode}, function(results, status) {

                // get city name from google maps API
                if (status == google.maps.GeocoderStatus.OK) {
                    lat_lng = results[0].geometry.location;
                    params.latitude = lat_lng.lat();
                    params.longitude = lat_lng.lng();
                    geocoder.geocode({'location': lat_lng}, function(results, status) {
                        // helper function
                        getCityName(results, status, "your provided zip code");
                    });
                } else {
                    notify.innerHTML="Geocode was not successful for the following reason: " + status;
                }
            });
        } else {
            notify.innerHTML="Sorry, the zipcode you entered is <span class=\"colorSpan\">not valid!</span>";
        }
    });

    // check if zip code is valid based on zip code length or if null
    function validateZipcode(zipcode) {
        if (isNaN(zipcode)) { return false; }
        if (zipcode.toString().length != 5) { return false; }
        var regex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
        return regex.test(zipcode);
    }

    // gets the name of the city from API results
    // input: how the location was provided (current location or inputted zip code), used to display location
    function getCityName(results, status, input) {
        if (status == google.maps.GeocoderStatus.OK) {
            var level_1;
            var level_2;

            // parses JSON for city and state names
            for (var x = 0, length_1 = results.length; x < length_1; x++) {
                for (var y = 0, length_2 = results[x].address_components.length; y < length_2; y++) {
                    var type = results[x].address_components[y].types[0];
                    if ( type === "administrative_area_level_1") {
                        level_1 = results[x].address_components[y].long_name;
                        if (level_2) break;
                    } else if (type === "locality"){
                        level_2 = results[x].address_components[y].long_name;
                        if (level_1) break;
                    }
                }
            }
            cityName = level_2 + ", " + level_1;
            params.city = cityName;
            displayLocation(cityName, params, input);
        } else {
            notify.innerHTML="Geocode was not successful for the following reason: " + status;
        }
    }


});

// displays the name of the city for user to confirm
function displayLocation(city, params, input) {
    notify.innerHTML = "Based on " + input + ", you are located in <span class=\"colorSpan\">" + city + ".</span>";
    var button1 = document.getElementById("toDistRange");
    button1.style.visibility = "visible";

    // goes on to next question - getting the distance range
    button1.addEventListener("click", function () { getDistRange(params); });
}

// accurately show the range slider and take in it's input value at the time of clicking "continue"
function getDistRange(params) {
    document.getElementById("getLocation").disabled = true;
    document.getElementById("toDistRange").disabled = true;
    $('input[id="distance"]').rangeslider({
        polyfill : false,
        onInit : function() {
            this.output = $( '<p class="range-output text-center" />' ).insertAfter(this.$range).html(this.$element.val() + " miles");
        },
        onSlide : function( position, value ) {
            this.output.html(value + " miles");
        }
    });

    // goes on to next question - getting the categories and price ranges
    document.getElementById('toCategories').addEventListener("click", function() {
        params.range = parseInt($('input[id="distance"]').val());
        getCategories(params);
    });
}

// Gets the requested categories, if no input is submitted the user asks to confirm an empty submission.
function getCategories(params) {
    document.getElementById('toCategories').disabled = true;
    var price = document.getElementById('price');
    price.style.visibility = "visible";
    // goes on to results page
    document.getElementById('toResults').addEventListener("click", function() {
        price = price.options[price.selectedIndex].value;

        switch (parseInt(price)) {
            case 1:
                params.price = "1, 2";
                break;
            case 2:
                params.price = "2, 3";
                break;
            case 3:
                params.price = "3, 4"
                break;
        }
        var categoryInput = document.getElementById('categories').value;
        if (categoryInput === "" || !isNaN(categoryInput)) {
            categoryInput = "food";
        }
        params.categories = categoryInput;
        // passes all the collected parameters/filters to Yelp API
        passJSON(params);
    });
}


// passes the collected data to the Yelp API to parse/display returned results
function passJSON(params) {
    $.ajax({
        url: "/data",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(params),
        success: function(e) {
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem("data", JSON.stringify(JSON.parse(e)));
                window.location = "/results";
            } else {
                console.log("can't store")
            }
        }
    });
}

// for google maps API - error handling
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}