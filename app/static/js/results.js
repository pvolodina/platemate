$(document).ready(function() {
    var data = JSON.parse(localStorage.getItem("data"));
    var results = document.getElementById('results');

    // creates 5 panels (elements) to display top 5 search results
    for (var i = 1; i <= 5; i++) {
        var newPanel = document.createElement("a");
        var business = 'business' + i;
        var categories = "";
        var dataObj = data[business]['categories'];

        for (var j = 0; j < dataObj.length; j++) {
            if (j === 0) {
                categories += data[business]['categories'][j]['name'];
            } else {
                categories += ", " + data[business]['categories'][j]['name'];
            }
        }

        // ratingImage displays the stars for a given business
        var ratingImage = "../static/images/yelp-stars/" + data[business]['rating'] + ".png";
        var bizImage = data[business]['image'];
        var address = data[business]['address'].toString().replace(",", ", ");
        var phone = data[business]['phone'];
        var url = data[business]['url'];
        var name = i + ". " + data[business]['name'];

        // each panel displays an individual business' information
        newPanel.innerHTML =
            "<a class=\"panel\" href=\"" + url +
            "\" target=\"_blank\"><div class=\"resultPanel\"><div class=\"half\"><h3>" + name +
            "</h3><h5>Address: " + address +
            "</h5><h5>Phone: " + phone +
            "</h5><h5>Categories: " + categories +
            "</h5><h5>Average Rating: <img class=\"stars\" src=\"" + ratingImage +
            "\"/></h5></div><div id=\"imgPanel\" class=\"imgPanel\"><img src=\"" + bizImage +
            "\" class=\"yelpImage center-block img-responsive\"/></div></div></a>";

        results.appendChild(newPanel);
    }
});