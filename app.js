var express = require('express'),
    path = require('path'),
    app = express();
    
const uri = '/groverapp/';
var app_directory = `grover-app`; // Files and assets directory

// Add the abillity to serve our static files from the public directory
app.use(uri, express.static(`/home/grovqbrq/${app_directory}/public`));
    
app.get(uri, function(req, res) {
    res.set('dirname', __dirname);
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

// Listen for requests
app.listen();


/* GROVER APP DIRECTORY STRUCTURE

/public
	index.html
	/js
	/clients
		/${client_id}
			owner.json
			products.json
			/img
				cover.png
				profile.png
				${product_pic}
*/