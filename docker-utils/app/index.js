'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Models = require('./models');

const app = express();

app.use(bodyParser.json());


app.post('/users', (req, res)=>{
  Models.User.create(req.body)
  .then(data=>{
        res.send(data)
      })
  .catch(err=>res.status(500).send(err))
});

app.get('/users/:id/canceled', function(req, res){
  Models.User.findOne({
    where:{
      id: req.params.id
    },
    include: [{
      model: Models.Appointment,
      through:{
        // ignores through model
        attributes: []
      },
      as: 'canceled'
    }]
  }).then(u=> {
    // Handle null result
    res.send(u)
  })
  .catch(err=> res.status(500).send())

});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
