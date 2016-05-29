let Component = require('../../utils/component')
let getModel = require('../../utils/model').getModel

class Forecast extends Component {
	getForecast() {
		return getModel('forecast')
		.then((model) => {
			return model.getForecast()
		})
	}

	render() {
		return this._render({
			forecast: this.getForecast()
		})
	}

	activate(domNode) {
		domNode.querySelector('#forecast-reload').addEventListener('click', event => {
			this.render().then(html => {
				domNode.innerHTML = html
				this.activate(domNode)
			})
		})
	}
}

module.exports = Forecast
