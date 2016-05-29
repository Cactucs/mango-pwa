if(typeof global != 'undefined') { // Node.js
	let nr = require // Hacked! Do not let jade be detected by webmake (find-requires)
	let jade = nr('jade')
	let fs = nr('fs')
	module.exports.compileFile = function (path) {
		return new Promise(function(resolve, reject) {
			let fn = jade.compileFile(__dirname + '/../' + path)
			resolve(fn)
		});
	}
	module.exports.compileFileClient = function (path) {
		return new Promise(function(resolve, reject) {
			let fn = jade.compileFileClient(__dirname + '/../' + path, {name: ' '})
			resolve(`(${fn})`)
		});
	}
	module.exports.page = function (name, contentOnly = false) {
		return new Promise(function(resolve, reject) {
			let text = ''
			if(contentOnly) {
				text = `include ${name}.jade`
			} else {
				text = `extends layouts/default\nblock content\n\tinclude ${name}.jade`
			}
			let fn = jade.compile(text, {filename: __dirname + '/../templates/nonexisting-generated-file.jade'})
			resolve(fn)
		});
	}
	module.exports.pageClient = function (name, contentOnly = false) {
		return new Promise(function(resolve, reject) {
			let text = ''
			if(contentOnly) {
				text = `include ${name}.jade`
			} else {
				text = `extends layouts/default\nblock content\n\tinclude ${name}.jade`
			}
			let fn = jade.compileClient(text, {name: ' ', filename: __dirname + '/../templates/nonexisting-generated-file.jade'})
			resolve(`(${fn})`)
		});
	}
} else { // Browser
	module.exports.compileFile = function (path) {
		return fetch(`/template?path=${path}`)
		.then((res) => {return res.text()})
		.then((js) => {
			return eval(js)
		})
	}
	module.exports.page = function (name, contentOnly = false) {
		return fetch(`/template/page?name=${name}&contentOnly=${contentOnly ? '1' : ''}`)
		.then((res) => {return res.text()})
		.then((js) => {
			return eval(js)
		})
	}
}
