const express = require('express');
const app = express();

// serve our static files
app.use(express.static(__dirname + '/dist/cookaroo'));

// wait for a request to any path and redirect all of the requests to index.html
app.get('/*', (req, res) => {
   
    res.sendFile(path.join(__dirname+'/dist/cookaroo/index.html'));
});

// listen for requests at the PORT specified by env variables or the default Heroku port, which is 8080
app.listen(process.env.PORT || 8080);