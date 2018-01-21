var express = require('express');
var app = express();

var url = require('url');

app.use(express.static('public'));

app.get("/", function(request, response){
  response.sendFile(__dirname + '/views/index.html');
})

app.use(function(req, res){
  var pathname = url.parse(req.url).pathname;
  //Take the extra slash off
  pathname = pathname.substring(1, pathname.length);
  
  //We need to verify that the url follows the http://www.example.com format; if not, we need to send an error response.

  //convert it all to lowercase
  //first 11 digits should be: http://www.
  //it should include .com

  //If verified, we need to look for it in mongo; if it's already htere, show the short stored version, otherwise
  //generate a unique the short url and put them both into a mongodb and then show it.
  
  //Note: output the pathname with an anchor around it
  
  var output = {
    'original url' : pathname
  };
  
  res.send(output);
  
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

