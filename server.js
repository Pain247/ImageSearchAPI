var express  = require('express');
var app = express();
app.listen(process.env.PORT||8000);
var mongo = require("mongodb").MongoClient;
var urldb="mongodb://va:123@ds151127.mlab.com:51127/search-db";
var Bing = require("node-bing-api")({ accKey: "9ONYazGHc9R8/RXzzP05fRs042a5CV0wMA6XVHTiIzg" });
var arr =[];

//Home Page
app.get('/', function(req, res, next) {
  res.sendFile(__dirname+'/'+'index.html');
});

// route to search
app.get('/search',function(req,res){
var date = new Date();
  var month= date.getMonth()+1;
  var hour = date.getHours();
  if(parseInt(hour)<10)hour="0"+hour;
  var min = date.getMinutes();
  if (parseInt(min)<10) {min="0"+min;}
  var sec = date.getSeconds();
  if(parseInt(sec)<10)sec="0"+sec;

var query = req.query.query;
var offset = req.query.offset;
var n = parseInt(offset);
var re=[];
var re1=[];
var re2=[];
var re3=[];
var final=[];
Bing.images(query, {top: n, market: 'es-ES'}, function(error, body){
   var ob = body.body;
   var ob1 = JSON.parse(ob);
   var ob2=ob1["d"]["results"];

  for(var i=0;i<ob2.length;i++){
    re.push(ob2[i]["MediaUrl"]);
  }
  for(var j=0;j<ob2.length;j++){
    re1.push(ob2[j]["Title"]);
  }
  for(var k=0;k<ob2.length;k++){
    re2.push(ob2[k]["SourceUrl"]);
  }
  for(var m=0;m<ob2.length;m++){
    re3.push(ob2[m]["Thumbnail"]["MediaUrl"]);
  }
  for(var a=0;a<n;a++){
   final[a]={
     "url":re[a],
     "Content": re1[a],
     "Thumbnail": re3[a],
     "Source": re2[a]
   };

  }
  res.send(final);
});
mongo.connect(urldb,function(err,db){
 var collection=db.collection('search');
 var newSearch = function(db,callbacks){
   var newImg = {
     key : query,
     When: hour+":"+min+":"+sec+" "+date.getDate()+"-"+month+"-"+date.getFullYear()
   };
   collection.insert([newImg]);
 };
 newSearch(db,function(){
   db.close();
 });


});

});
//route to history
app.get('/recent',function(req,res){
mongo.connect(urldb,function(err,db){
  var collection=db.collection('search');
  var DislaySearch = function(db,callbacks){
  collection.find({},{key:1,When:1,_id:0}).toArray(function(err,doc){
      for(var e =0;e < doc.length;e++){
        arr[e] = doc[doc.length-1-e];
      }
      res.send(arr);
  });


};

DislaySearch(db,function(){
  db.close();
});
});


});
