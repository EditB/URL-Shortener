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

  //Convert input to lowercase (to get it ready for the next check)
  pathname = pathname.toLowerCase();
  //console.log(pathname);

  first11Digits = pathname.substring(0, 11);
  //console.log(first11Digits);
  //console.log(pathname.length);

  //Need to make sure the first 11 digits is http://www.; 
  //also need to make sure the url has the above 11 digits + 4 (for .com) + something else in between;
  //and it should have a .com in it too.
  if ((first11Digits == "http://www.") && 
      (pathname.length > 15) && 
      (pathname.indexOf(".com") !==-1)) {
    //We have a valid url format

    //We need to assign a short url to the input and save both to
    //mongoDB urls collection

    //Then in the output we need to assign the original anchor to the short version
    //ALso, if we copy and paste the short url in a different window it should work as well...
    //how do we route it?? - We need to get it as the pathname and then look it up in the DB 
    //and route it to it's long pair

    //Q: how do we distinguish between a url to be shortened and a short url to be routed?? 
    //As they need different actions, yet the input happens the same way...
    //https://little-url.herokuapp.com returns /new/shortURL, so if the url starts with /new you know
    //it needs to be routed...

    //Note: https://shurli.herokuapp.com/ works better, do prefer that logic.
    
    //!!!!! So based on that we need to re-write this code: 
    
    //Get pathname as we already are doing

    //Check if it's in the database; if it is:
    //  - if it's a long one: return that as the original, with the shortened pair
    //  - if it's the short one: redirect it to the orignial one (with res.redirect()??)

    // If it's not in the db:

    //Make sure it's a working URL - need to do some research for this one!
    //Try to get it with http.get() and then see if there's a response or an error...
    //If we got a valid response, it's an existing website: we can shorten it;
    //create a shortened website, (make sure we don't get a response for it as 
    //it should be ideally unique...), and then we save them both to the db.
    //And return the pair in the response.

    //Note: for the short URL we can just save the ending, and when redirecting we just add the baseURL(like shorturl.glitch.me/ to it)

    var output = {
    'original url' : pathname
    };
  }
  else {
    //not following the needed format:
    var output = {
      'error: ' : "Please make sure your url follows the http://www.example.com format"
    };
  }
  
  //We need to verify that the url follows the http://www.example.com format; if not, we need to send an error response.

  //convert it all to lowercase
  //first 11 digits should be: http://www.
  //it should include .com

  //If verified, we need to look for it in mongo; if it's already htere, show the short stored version, otherwise
  //generate a unique the short url and put them both into a mongodb and then show it.
  
  //Note: output the pathname with an anchor around it
  
  
  
  res.send(output);

})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

