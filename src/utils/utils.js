const axios = require('axios');

function convertLeafletPolygonToWktFormat(polygon) {

    let latLngArray = polygon.getLatLngs()[0];

    let WktString = "POLYGON ((";

    for (let i=0; i < latLngArray.length; i++) {
        WktString = WktString + latLngArray[i].lng.toString() + " " + latLngArray[i].lat.toString() + ", "
    }

    // Append the first point of the polygon again
    WktString = WktString + latLngArray[0].lng.toString() + " " + latLngArray[0].lat.toString() + "))";

    return WktString;
}

async function requestPolygonData(polygon) {

    let polygonString = convertLeafletPolygonToWktFormat(polygon);
    let queryString = "subset=intersects(" + polygonString + ")";

    let url = "http://rz-vm154.gfz-potsdam.de:8080/highprecip/events/query?subset=si(0.1,20)&" + queryString;

    window.console.log(url);

    let response = await axios({
        method: "get",
        url: url
    });

    window.console.log(response);

    return processResponseData(response.data)

}

function processResponseData(responseData) {

    let result = {
        dataPoints: []
    };

    // Calculate the amount of datapoints
    result.amount = responseData.length;

    let total_intensity = 0.0;
    let total_duration = 0;

    let max_intensity = 0.0;
    let max_duration = 0;

    for (let i=0; i < responseData.length; i++) {

        result.dataPoints.push({
            date: responseData[i].start.slice(0,4),
            intensity: responseData[i].si,
            duration: responseData[i].length
        })


        let intensity = responseData[i].si

        if (intensity > max_intensity) {
            max_intensity = intensity;
        }

        total_intensity += intensity;

        let duration = responseData[i].length

        if (duration > max_duration) {
            max_duration = duration;
        }

        total_duration += duration;
    }

    result.intensity = {
        "max": max_intensity,
        "average": total_intensity / result.amount
    };

    result.duration = {
        "max": max_duration,
        "average": total_duration / result.amount
    };

    return result;
}

function getGlobalData() {
    let data = require('./new_all_data.json');

    return processResponseData(data);
}


function rgbToHex (rgb) {

	let hex = "#"

    let r = rgb[0].toString(16)
    if (r.length < 2) {
    r = "0" + r
    }

    hex += r;

    let g = rgb[1].toString(16)
    if (g.length < 2) {
    g = "0" + g
    }

    hex += g;

    let b = rgb[2].toString(16)
    if (b.length < 2) {
    b = "0" + b
    }

    hex += b;

    return hex
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
    ] : null;
}
function isInt(n) {
   return n % 1 === 0;
}

export {requestPolygonData, getGlobalData, rgbToHex, hexToRgb, isInt}