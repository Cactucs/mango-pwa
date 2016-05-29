let Component = require('../../utils/component')

class Random extends Component {

	getRandom() {
		return require('../../utils/model').getModel('random').then(model => model())
	}

	render() {
		return this._render({
			random: this.getRandom()
		})
	}

	activate(domNode) {
		console.log('Activating random');
		domNode.querySelector('button').addEventListener('click', () => {
			this.getRandom().then((random) => {
				domNode.querySelector('.random-number').innerHTML = random.number
			})
		})
	}
}

module.exports = Random
