require('whatwg-fetch')

require('./components')

new Promise((resolve, reject) => {
	if(window.appshell) {
		console.log('Appshell!!')
		let renderer = new (require('./utils/renderer'))
		renderer.render('index', true)
		.then((response) => {
			console.log(response);
			document.getElementsByTagName('main')[0].innerHTML = response
		}).then(resolve, reject)
	} else {
		resolve()
	}
}).then(() => {
	console.log('Afcts');
	// Activating components
	let r = require // Webmake, please chill
	document.querySelectorAll('[id^=component]').forEach((componentNode) => {
		console.log(componentNode);
		let [, name, index] = componentNode.id.split('-')
		let component = new (r(`./components/${name}`))(componentNode.id)
		component.activate(componentNode)
	})
})


// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function(registration) {
    // Registration was successful
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(function(err) {
    // registration failed :(
    console.log('ServiceWorker registration failed: ', err);
  });
}
