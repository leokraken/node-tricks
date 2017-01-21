'use strict';

const co = require('co');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// custom imports
const examples = require('./controllers/example-controller');
const Models = require('./models/index');
const context = require('./utils/cls');

var session = context.createNamespace();

const app = express();

app.use(bodyParser.json());


app.use((req, res, next)=> {
  session.bindEmitter(req);
  session.bindEmitter(res);

  session.run(function () {
    let token = req.headers.authorization;
    // token fun
    let claims = {
      test: 'admin',
      roles: ['read', 'write'],
      token: token
    };
    context.set('auth', claims);
    next();
  });
});

app.post('/users', (req, res)=> {
  Models.User.create(req.body)
    .then(data=> res.send(data));
});

app.get('/users', (req, res)=> {
  Models.User.findAll()
    .then(users=>res.send(users));
});

app.get('/users/:id', (req, res)=> {
  Models.User.findById(req.params.id)
    .then(user=> {
      if (user) {
        res.send(user);
      } else {
        res.status(404).send();
      }
    });
});

app.patch('/users/:id', (req, res)=> {
  Models.User.update(req.params.id, req.body)
    .then(user=>res.send(user));
});

app.delete('/users/:id', (req, res)=> {
  Models.User.deleteById(req.params.id)
    .then(user=>res.send(user));
});


app.get('/ping', function (req, res) {
  console.log(context.get('auth'));
  res.send('pong!');
});

app.get('/users/:id/appointments', function (req, res) {
  Models.User.findUserAppointments(req.params.id)
    .then(data=> res.send(data.toJSON({omitPivot: true})));
});


app.get('/token', function (req, res) {
  let token = jwt.sign({
    data: 'foobar'
  }, 'secret', {expiresIn: 0});
  res.send(token);
});


app.get('/token/verify', function (req, res) {
  let token = req.headers.authorization;
  jwt.verify(token, 'secret', {ignoreExpiration: false}, (err, claims)=> {
    if (!err) {
      res.send(claims);
    } else {
      res.status(401).send(err);
    }
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
