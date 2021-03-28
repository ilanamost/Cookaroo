const express = require('express');
const path = require('path');
const app = express();

function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/cookaroo'));

// wait for a request to any path and redirect all of the requests to index.html
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/cookaroo/index.html'));
});

// listen for requests at the PORT specified by env variables or the default Heroku port, which is 8080
app.listen(process.env.PORT || 8080);

