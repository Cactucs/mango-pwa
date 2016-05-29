module.exports.create = function (url, params) {
	let query = []
	for (let key in params) {
		query.push(key + '=' + params[key])
	}
	return url + '?' + query.join('&')
}
