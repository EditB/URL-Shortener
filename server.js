
var express = require('express');
var app = express();
var url = require('url');
var mongodb = require('mongodb');
var mongodburl = 'mongodb://localhost:27017/urlshortener';
var output = {'error' : "There was an error during processing"};
var shortURLStr = "https://www.url-shortener-e.glitch.me/";
var counter = 0;
var shortURLStrCtr = "";
var longURLArr;
var shortULRArr;

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

        first11Digits = pathname.substring(0, 11);
        console.log('first11Digits after new: ' + first11Digits);

        if (((first11Digits == "http://www.") || (first11Digits == "https://www")) && 
          (pathname.length > 16) && (secondDot > -1)) {

          console.log("checking if it's in database");
        
          //Need to check if it's in the database; if it is: return the long-short pair; 
          collection.find(
          {'longURL': pathname}).toArray(function(err, documents) {
            if (err) throw err;
            console.log("in collection.find; next log will be documents");
            console.log("documents: " + JSON.stringify(documents));
            longURLArr = documents;
            console.log('longURLArr: ' + JSON.stringify(longURLArr)); 
          

            if (longURLArr.length > 0) {
              console.log('found long url');
              output = {
              'original url' : longURLArr[0],
              'short url' : longURLArr[1]
              };
              console.log('output after finding longURL: ' + JSON.stringify(output));
            }
            else {
              console.log('Long URL is not in the database');
              //create a unique short url and save it to the database. 
              //ShortURL generating logic:
              //Find the biggest (MAX) short url number and add 1 to it
              if (counter !== 0){
                  console.log("counter is not zero...");
                  var maxRecord = collection.find().sort({shortULR:-1}).limit(1).toArray(function(err, documents) {
                  if (err) throw err
                  console.log(documents);

                  //Turn counter to str!
                  counter = parseInt(maxRecord[2]);
                  counter += 1;
                  console.log("counter: " + counter);
                });  
              }
              
              shortURLStrCtr = "" + counter;
              console.log("shortURLStr: " + shortURLStr);
              console.log('before insert');
              console.log("pathname: " + pathname + " shortURLStr: " + shortURLStr);
              collection.insert(
                { 'longURL' : pathname, 'shortURL': shortURLStrCtr}, 
                function(err, documents) {
                  console.log(err);
                  if (err) throw err;
                  //console.log(JSON.stringify({ longURL : pathname, shortURL: shortURLStr}));
                  console.log('documents at inserting: ' + JSON.stringify(documents));
                  console.log('after insert');
                  output = {
                    'original URL: ' : pathname,
                    'short URL' : (shortURLStr + shortURLStrCtr)
                };
                console.log('output after insert: ' + JSON.stringify(output));
                console.log("before closing connection");
                console.log("output: " + JSON.stringify(output));
                res.send(output);
                //Close connection
                db.close();  
              });
            }
            
          });
          console.log("finished collection.find(longURL) block");
        }
        //If not valid: return error msg
        else {
          console.log("/new/ wasn't a valid format url");
          output = {'error: ' : "Please make sure your url follows the /new/http://www.example.com format"};
          console.log("before closing connection");
          console.log("output: " + JSON.stringify(output));
          res.send(output);
          //Close connection
          db.close();
        }
      }
      else{
        console.log('short URL');
        //Need to strip pathname off https://www.url-shortener-e.glitch.me/
        shortURLStrCtr = pathname.substring(38, pathname.length);
        console.log("shortURLStr: " + shortURLStr);

        if (((first11Digits == "http://www.") || (first11Digits == "https://www")) && 
          (pathname.length > 13) && (secondDot > -1)) {
          console.log('short url valid format');
          //find shortURL in db; if found: redirect; if not: just give error msg.
          collection.find(
          {'shortURL': shortURLStrCtr}).toArray(function(err, documents) {
            if (err) throw err;
            console.log("in collection.find shortURL;");
            console.log("documents: " + JSON.stringify(documents));
            console.log('documents[0]: ' + JSON.stringify(documents[0]));
            console.log('documents[0]["longURL"]: ' + documents[0]["longURL"]);
            console.log("documents.length: next log");
            console.log(documents.length);
            //shortULRArr = documents;
            if (documents.length > 0){
              //redirect
              console.log('before redirectig');
              res.redirect(documents[0]["longURL"]);
              console.log("before closing connection");
              //Close connection
              db.close();  
            }
            else{
              output = {"error" : "This short URL is not in our database"}
              console.log("before closing connection");
              console.log("output: " + JSON.stringify(output));
              res.send(output);
              //Close connection
              db.close();  
            }

            
        
          });  

          //output = {'original url' : pathname};
          //console.log('output short: ' + JSON.stringify(output));
        }
        else{
          console.log("short URL is not in a valid format");
          output = {'error: ' : "Please make sure your url follows the /http://www.example.com format"};
          console.log("before closing connection");
          console.log("output: " + JSON.stringify(output));
          res.send(output);
          //Close connection
          db.close();  
        
        }
      } 
    }
//Problem: this will happen before the above code finished running; in other words,
//it seems to be async and before the lines above finished this will just close db and cause trouble;
//Need to close in a callback somehow???
    //console.log("before closing connection");
    //console.log("output: " + JSON.stringify(output));
    
    //res.send(output);
    //Close connection
    //db.close();  
    //console.log('output short3: ' + JSON.stringify(output));
  
  //console.log('output short4: ' + JSON.stringify(output));
  //Note: output the pathname with an anchor around it - still need to implement it!
  
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

    

