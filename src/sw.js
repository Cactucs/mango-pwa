// Version: 4
const staticUrls = [
	'/static/client.js',
	'/static/node_modules/jade/runtime.js',
	'/static/styles/index.css',
	'/static/styles/print.css',
	'/appshell.html'
]

let toolbox = require('sw-toolbox')
let helpers = require('../node_modules/sw-toolbox/lib/helpers')

function getParameterByName(name, url) {
	name = name.replace(/[\[\]]/g, "\\$&")
	let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
	let results = regex.exec(url)
	if (!results) return null
	if (!results[2]) return ''
	return decodeURIComponent(results[2].replace(/\+/g, " "))
}

toolbox.options.debug = false
toolbox.router.default = toolbox.networkFirst


toolbox.precache(staticUrls)

let model = require('./utils/model')
toolbox.router.get('/model', (req, vals, opts) => {
	let modelPath = getParameterByName('_modelPath', req.url).split('.')
	let args = getParameterByName('args', req.url).split(',')
	return model.getModel(modelPath.shift())
	.then((model) => {
		if(model) {
			while (modelPath.length > 0) {
				model = model[modelPath.shift()]
			}
			return JSON.stringify(model(...args))
		} else {
			return fetch(req)
		}
	})

})

toolbox.router.get('/model', toolbox.networkOnly)

toolbox.router.get('/template', toolbox.cacheFirst)

toolbox.router.get('/', (res, vals, opts) => {
	return helpers.openCache(toolbox.options).then(cache => {
		return cache.match('/appshell.html')
	})
})

toolbox.router.get(staticUrls, toolbox.cacheFirst)

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
