'use strict';

const co = require('co');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Keycloak = require('keycloak-connect');

// custom imports
const examples = require('./controllers/example-controller');
//const Models = require('./models/index');
const context = require('./utils/cls');

var session = context.createNamespace();

const app = express();

app.use(bodyParser.json());


app.use((req, res, next)=> {
  session.bindEmitter(req);
  session.bindEmitter(res);

  session.run(function () {
/*
     let token = req.headers.authorization;
     // token fun
     let claims = {
     test: 'admin',
     roles: ['read', 'write'],
     token: token
     };
     context.set('auth', claims); */
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

app.get('/mongo/users/:id', (req, res)=> {
  Models.User.findByIdMongo(req.params.id, function (err, result) {
    res.send(result);
  });
});

app.delete('/users/:id', (req, res)=> {
  Models.User.deleteById(req.params.id)
    .then(user=>res.send(user));
});


app.get('/ping', function (req, res) {
  res.send('pong!');
});

// keyclaok
const keycloak = new Keycloak({ scope: 'offline_access' });

app.use(keycloak.middleware( { logout: '/logoff' }));

app.get('/ping2', keycloak.protect(), function (req, res) {
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

app.get('/items/:id', function (req, res) {
  res.send({id:1, name:'leo'});
});


app.post('/messages/:to', (req, res)=> {
  io.sockets.in(req.params.to).emit('news', {message: req.body.message});
  res.send();
});

app.get('/especialidades', function (err, res) {
  var async = require('async')
  process.namespaces.myapp.set('key', {a: 'asdsadasd'});

  async.auto({
    search: examples.apiRequest,
    leo:  ['search', function (res, cb) {
      console.log(process.namespaces.myapp.get('key'))
      cb(null);
    }]
  }, function (err, results) {
    console.log(process.namespaces.myapp.get('key'))

    res.send(results)
  });
});


/**
 * Websockets
 */
/*
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function (socket) {
  console.log(socket.id)
  //socket.join('test');

  //When connect socket is connected to socket.id room
  io.sockets.in(socket.id).emit('news', {ok: 'single'});
  // Emits to room
  //io.in('test').emit('news', {ok: true});

  //single response on connect
  socket.on('disconnect', function (data) {
    console.log(data);
  });
}); */


const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
app.listen(3000, ()=> {
  console.log('running...')
});
/*
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs / 2; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  app.listen(3000, ()=> {
    console.log('running...')
  });

  console.log(`Worker ${process.pid} started`);
}
*/

/*
 server.listen(3000, function () {
 console.log('Example app listening on port 3000!');
 });

 */
