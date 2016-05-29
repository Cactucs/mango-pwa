
module.exports.getForecast = function () {
	return fetch('https://api.forecast.io/forecast/API_KEY/50.0880400,14.4481606?units=si&lang=cs')
	.then((res) => {return res.json()})
}
module.exports.getTemperature = function () {
	return module.exports.getForecast()
	.then((json) => {return {temperature: json.currently.temperature}})
}
