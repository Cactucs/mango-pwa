const PORT = 3000

require('isomorphic-fetch')

let jade = require('jade')

let express = require('express')
let app = express()
app.use('/static', express.static(__dirname+'/../dist'))
app.use('/sw.js', express.static(__dirname+'/../dist/sw.js'))
app.use('/favicon.ico', express.static(__dirname+'/../dist/favicon.ico'))

let templating  = require('./utils/templating')
app.get('/template', (req, res) => {
	templating.compileFileClient(req.query.path).then((page) => res.send(page)).catch(e => {
		res.status(500).send('Server error')
		console.error(e)
	})
})
app.get('/template/page', (req, res) => {
	templating.pageClient(req.query.name, !!req.query.contentOnly).then((page) => res.send(page)).catch(e => {
		res.status(500).send('Server error')
		console.error(e)
	})
})

let model = require('./utils/model')

app.get('/model', (req, res) => {
	let modelPath = req.query._modelPath.split('.')
	const args = req.query.args ? req.query.args.split(',') : []
	model.getModel(modelPath.shift())
	.then((model) => {
		//model = model()
		while (modelPath.length > 0) {
			model = model[modelPath.shift()]
		}
		return model(...args)
	})
	.then((data) => {
		res.json(data)
	})
	.catch((error) => {
		res.status(500).json({error: 'Server error'})
		console.log('Error:')
		console.log(error)
	})
})

let renderer = new (require('./utils/renderer'))
app.get('/appshell.html', (req, res) => {
	console.log('GET / (appshel)')
	renderer.render('shell')
	.then(response => {
		res.send(response)
	})
})

app.get('/:page?', (req, res) => {
	let contentOnly = !!req.query.contentOnly
	let page = (req.params.page) ? req.params.page : 'index'
	console.log(`GET / (${page}) ${contentOnly ? 'contentOnly' : 'contentAlso'}`)
	renderer.render(page, contentOnly)
	.then((response) => {
		res.send(response)
	})
	.catch((error) => {
		res.status(500).send('Server error')
		console.error(error);
	})
})

app.listen(PORT)
console.log(`App is listening on port ${PORT}`);
