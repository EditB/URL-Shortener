var express = require('express');
var app = express();
var url = require('url');

var mongodb = require('mongodb');
//var mongodburl = 'mongodb://localhost:27017/urlshortener';
//Note: when using localhost, just comment out the line below and use the line above...
var mongodburl = process.env.SECRET;
var output = {'error' : "There was an error during processing"};
var shortURLStr = "https://url-shortener-e.glitch.me/";
var counter = 0;

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
  console.log('pathname: '+pathname);

  var firstDot = pathname.indexOf('.');
  //There should be at least one character between www. and the .com
  firstDot +=1;
  var secondDot = pathname.indexOf('.', firstDot);
  
  var first11Digits = pathname.substring(0, 11);
  var first3Digits = pathname.substring(0,3);

console.log('first3Digits: ' + first3Digits);  
  
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
        //We should get rid of new/ from pathname and then use that pathname for check, insert and output!!!
        pathname = pathname.substring(4, pathname.length);
        console.log("pathname: " + pathname);

        //first11Digits = pathname.substring(0, 11);
        var first7Digits = pathname.substring(0, 7);
        
        //Url should start with http:// or https://; it should have at least one dot in it and 
        //it should be min 10 digits long(http:// + . + at least 2 characters, one for body, one for extension...)
        if (((first7Digits == "http://") || (first7Digits == "https:/")) && 
          (pathname.length > 16) && (firstDot > -1)) {
       
          //Need to check if it's in the database; if it is: return the long-short pair; 
          collection.find(
          {'longURL': pathname}).toArray(function(err, documents) {
            if (err) throw err;
            console.log("in collection.find; next log will be documents");
            console.log("documents: " + JSON.stringify(documents));
            var longURLArr = documents;
            console.log('longURLArr: ' + JSON.stringify(longURLArr)); 
          

            if (longURLArr.length > 0) {
              output = {
              'original url' : longURLArr[0]["longURL"],
              'short url' : shortURLStr + longURLArr[0]["shortURL"]
              };
              
              res.send(output);
              //Close connection
              db.close(); 
            }
            else {
              
              collection.count(function (err, count) {
                if (err) throw err;
                console.log('in count; count: ' + count);
                  if (!err) {
              
                  console.log('about to find MAX ShortURL; counter: ' + counter);
                  collection.find().sort({shortURL:-1}).limit(1).toArray(function(err, documents) {
                    if (err) throw err;
                    console.log("documents: " + JSON.stringify(documents));
                    
                    if (count > 0){
                      counter = documents[0]["shortURL"];  
                    }
                    
                    counter += 1;
              
                    collection.insert(
                      { 'longURL' : pathname, 'shortURL': counter}, 
                      function(err, documents) {
                      console.log(err);
                      if (err) throw err;
                      var newShortURL = shortURLStr + "" + counter;  
                      output = {
                        'original URL: ' : pathname,
                        'short URL' : newShortURL
                      };
                    
                      res.send(output);
                      //Close connection
                      db.close();  
                    });
                  });    
                } 
            });

            }
            
          });
          
        }
        //If not valid: return error msg
        else {
          
          output = {'error: ' : "Please make sure your url follows the /new/http://www.example.com format"};
          res.send(output);
          //Close connection
          db.close();
        }
      }
      else{
        console.log('short URL');

        var shortURLStrCtr = parseInt(pathname);
        console.log("shortURLStrCtr: " + shortURLStrCtr);
        if (isNaN(shortURLStrCtr)){
          output = {'error: ' : "Please make sure the short URL follows the 'https://url-shortener-e.glitch.me/1' format; If you wish to shorten a long url please star it with /new/"};
          res.send(output);
          //Close connection
          db.close();          
        }
        else{
          console.log("Before finding shortURL: " + shortURLStrCtr);
          collection.find(
          {'shortURL': shortURLStrCtr}).toArray(function(err, documents) {
            if (err) throw err;
            if (documents.length > 0){
              //redirect
              res.redirect(documents[0]["longURL"]);
              //Close connection
              db.close();  
            }
            else{
              output = {"error" : "This short URL is not in our database"}
              res.send(output);
              //Close connection
              db.close();  
            }
          });  
        }
      } 
    }
  //Note: output the pathname with an anchor around it - still need to implement it!
  });
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

