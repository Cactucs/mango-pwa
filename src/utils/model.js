let offlineModels = {
	random: require('../model/random')
}

// Returns a promise which resolves to function which returns the requested model
module.exports.getModel = function (modelName) {
	return new Promise(function(resolve, reject) {
		if (typeof global != 'undefined') { // Node.js
			let nr = require // Hacked! Do not let jade be detected by webmake (find-requires)
			resolve(nr(`../model/${modelName}`))
		} else { // Browser
			if(offlineModels[modelName]) {
				resolve(offlineModels[modelName])
				return
			}

			let url = require('./url')

			let createProxy = (name) => {
				let target = function () {};
				target._modelPath = name
				return new Proxy(target, {
					apply: (target, self, args) => {
						return fetch(url.create('/model', {_modelPath: target._modelPath.join('.'), args: args.join()}))
						.then(res => res.json())
					},
					get: (target, property, reciever) => {
						if(typeof target[property] != "undefined") {
							return target[property]
						}
						if(property == 'then') {
							return undefined
						}
						if(property == 'inspect') {
							console.log('This is dangerous. You are calling console log on proxy. Don\' do it.') // Fix me, please!
							return undefined
						}
						let name = target._modelPath.concat([property])
						// !! _modelName
						return createProxy(name)
					}
				})
			}

			let proxy = createProxy([modelName])
			resolve(proxy)
		}
	})
}
