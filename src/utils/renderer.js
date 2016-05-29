let templating = require('./templating')

class Renderer {
	getDependentComponents(compiledTemplate) {
		return compiledTemplate.then((template) => {
			let wantedComponents = []
			let proxy = new Proxy({}, {
				get: (target, property, reciever) => {
					if(typeof target[property] != "undefined") return target[property]
					// if(property == 'then') return undefined;
					// if(property == 'inspect') throw new Error('This is dangerous. You are calling console log on proxy. Don\' do it.') // Fix me, please!

					wantedComponents.push(property)
					return undefined
				}
			})
			template({
				components: proxy
			})
			let comps = []
			let renderPromises = []
			let r = require // Shut up webmake!
			wantedComponents.forEach((compName, index) => {
				let component = new (r(`../components/${compName}`))(`component-${compName}-${index}`)
				comps.push(component)
				renderPromises.push(component.render())
			})
			return Promise.all(renderPromises).then((renderedComponets) => {
				let renderedComponetsObj = {}
				wantedComponents.forEach((compName, index) => {
					renderedComponetsObj[compName] = renderedComponets[index]
				})
				return renderedComponetsObj
			})
		})
	}

	render(url, contentOnly = false) {
		//let compiledTemplate = require('./templating').compileFile(`templates/${url}.jade`)
		let compiledTemplate = templating.page(url, contentOnly)
		return Promise.all([compiledTemplate, this.getDependentComponents(compiledTemplate)])
		.then((promises) => {
			let template = promises[0]
			let components = promises[1]
			return template({
				components
			})
		})
	}
}


module.exports = Renderer
