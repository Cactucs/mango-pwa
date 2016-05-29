let templating = require('./templating')

class Component {
	constructor(id) {
		if (new.target === Component) {
			throw new TypeError("Cannot construct Component instances directly");
		}
		this.id = id
		this.componentName = this.constructor.name.toLowerCase()
	}

	_getTemplate() {
		return new Promise((resolve, reject) => {
			return templating.compileFile(`components/${this.componentName}/template.jade`).then(resolve, reject)
		})
	}

	// Get all components in passed template
	_getDependentComponents(template) {
		return new Promise((resolve, reject) => {
			let wantedComponents = []

			let createProxy = function(path = []) {
				let f = function () {}
				f.__path = path
				return new Proxy(f, {
					get: (target, property, reciever) => {
						//if(property == "toString") return ((123.12).toString)
						// if(typeof target[property] != "undefined") return target[property]
						// if(property == 'then') return undefined;
						// if(property == 'inspect') throw new Error('This is dangerous. You are calling console log on proxy. Don\' do it.') // Fix me, please!
						if(property == 'toISOString') return undefined;

						if(target.__path.length == 1 && target.__path[0] == 'components') {
							wantedComponents.push(property)
						}
						return createProxy(target.__path.concat([property]))
					},
					has: (target, prop) => true,
					apply: (target, self, args) => {
						if(target.__path[target.__path.length - 1] == "toString") return "a"
						return undefined
						//return createProxy(target.__path.concat([property + '()']))
					}
				})
			}

			template(createProxy())
			let comps = []
			let renderPromises = []
			let r = require // Shut up webmake!
			wantedComponents.forEach((compName, index) => {
				let component = new (r(`../components/${compName}`))(`component-${compName}-${index}`)
				comps.push(component)
				renderPromises.push(component.render())
			})
			Promise.all(renderPromises).then((renderedComponets) => {
				let renderedComponetsObj = {}
				wantedComponents.forEach((compName, index) => {
					renderedComponetsObj[compName] = renderedComponets[index]
				})
				return renderedComponetsObj
			}).then(resolve, reject)
		})
	}

	_render(customVariables = {}) {
		return new Promise((resolve, reject) => {
			let promises = []
			let promisesKeys = []
			Object.keys(customVariables).forEach((key) => {
				let value = customVariables[key]
				promises.push(value)
				promisesKeys.push(key)
			})

			let varsProm = Promise.all(promises)
			let templatePromise = this._getTemplate()
			let dependent = templatePromise.then(template => this._getDependentComponents(template))
			Promise.all([varsProm, templatePromise, dependent]).then((promises) => {
				let [varsPromVals, template, components] = promises
				let vars = {}
				varsPromVals.forEach((value, index) => {
					vars[promisesKeys[index]] = value
				})
				let locals = Object.assign({components, id: this.id}, vars)
				return template(locals)
			}).then(resolve, reject)
		})
	}

	// Abstract
	render() {}

	// Abstract
	activate(domNode) {}
}

module.exports = Component
