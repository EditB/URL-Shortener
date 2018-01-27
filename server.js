
var express = require('express');
var app = express();
var url = require('url');
var mongodb = require('mongodb');
var mongodburl = 'mongodb://localhost:27017/urlshortener';
var output = {'error: ' : "Please make sure your url follows the /new/http://www.example.com format"};
var shortURLStr = "https://url-shortener-e.glitch.me/t1";

app.use(express.static('public'));

app.get("/", function(request, response){
  response.sendFile(__dirname + '/views/index.html');
})

//We might have a straight url (which is the short one, to be redirected
  //If it's in the db: redirect
  //if not: error msg (we couldn't find this short url in the db; if you want to shorten it, enter it with a /new/)
//or we might have a new/ which is one to be shortened and saved in the db
  //Strip it of new/ and check its format (note: should create a validFormat() function?)
    //If it's valid: shorten, save into db and return both long and short url
    //If not: return error msg  
app.use(function(req, res){
  var pathname = url.parse(req.url).pathname;
  //Take the extra slash off
  pathname = pathname.substring(1, pathname.length);

  //Convert input to lowercase (to get it ready for the next check)
  pathname = pathname.toLowerCase();
  console.log(pathname);
  var firstDot = pathname.indexOf('.');
  //There should be at least one character between www. and the .com
  firstDot +=1;
  var secondDot = pathname.indexOf('.', firstDot);
  console.log('firstDot: ' + firstDot + ' secondDot: ' + secondDot);

  var first11Digits = pathname.substring(0, 11);
  var first3Digits = pathname.substring(0,3);

  mongodb.MongoClient.connect(mongodburl, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      output = {'error': "couldn't connect to MongoDB"};
    } 
    else {
      //Successfully connected to MongoDB
      console.log('Connected to MongoDB');
      var collection = db.collection('urls');

      if (first3Digits == 'new'){
        console.log('new');
        //Supposed to be a long url
        //we need to strip it off for the first11Digit validation; 
        //We need to have 2 dots

        //We should get rid of new/ from pathname and then use that pathname for check, insert and output!!!
        pathname = pathname.substring(4, pathname.length);
//NOTE2: since we are doubling up in code, we should split the checks into a checkURL() method that returns true/false and you need to pass in the pathname

//NOTE3: Still need to add logic to generate a uniqe shortURLStr!!!!!!!
        first11Digits = pathname.substring(0, 11);
        console.log('first11Digits after new: ' + first11Digits);
        if (((first11Digits == "http://www.") || (first11Digits == "https://www")) && 
          (pathname.length > 16) && (secondDot > -1)) {
          
          //Valid format: shorten and save to db
          console.log('before insert');
          collection.insert(
            { 'longURL' : pathname, 'shortURL': shortURLStr}, 
            function(err, documents) {
              if (err) throw err;
              //console.log(JSON.stringify({ longURL : pathname, shortURL: shortURLStr}));
              console.log('documents at inserting: ' + JSON.stringify(documents));
            }
          );
          console.log('after insert');
          
          output = {
            'original URL: ' : pathname,
            'short URL' : shortURLStr 
          };
          console.log('output: ' + JSON.stringify(output));
        }
        //If not valid: return error msg
        else {
          output = {'error: ' : "Please make sure your url follows the /new/http://www.example.com format"};
        }
      }
      else{
        console.log('short URL');
        //Supposed to be a short url
        //If valid format: redirect
        //if not valid format: return error msg
 
        //console.log(first11Digits);
        //console.log(pathname.length);

        //Need to make sure the first 11 digits is http://www.; 
        //also need to make sure the url has the above 11 digits + 1 (for a dot) + something else in between;
        if (((first11Digits == "http://www.") || (first11Digits == "https://www")) && 
          (pathname.length > 13) && (secondDot > -1) && (secondDot !== firstDot)) {
          console.log('short url valid format');
          output = {'original url' : pathname};
          console.log('output short: ' + JSON.stringify(output));
        }
        else{
          output = {'error: ' : "Please make sure your url follows the /http://www.example.com format"};
        }
      } 
    }
    //Close connection
    db.close();  
    //console.log('output short3: ' + JSON.stringify(output));
  
  //console.log('output short4: ' + JSON.stringify(output));
  //Note: output the pathname with an anchor around it - still need to implement it!
  res.send(output);
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

    

