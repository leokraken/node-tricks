//console.log('hello world');
'use strict'

var express = require('express');
//var controller = require('./controller');


var app = express();

function crash(cb){
  var a;
  console.log(a.asdd.sd);
}

app.get('/error', function(req, res){
  process.exit(1);
  var a= null;
  //controller.a();
  //throw new Error('Sync error');
  console.log(req.params.asd.ks);
})

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
