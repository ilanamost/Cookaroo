const express = require('express');
const path = require('path');
const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/Cookaroo'));

// wait for a request to any path and redirect all of the requests to index.html
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Cookaroo/index.html'));
});

// listen for requests at the PORT specified by env variables or the default Heroku port, which is 8080
app.listen(process.env.PORT || 8080);

