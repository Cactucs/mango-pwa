module.exports = function () {
	return new Promise(function(resolve, reject) {
		resolve({
			number: Math.floor(Math.random()*100)
		})
	})
}
