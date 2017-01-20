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
        /* Continue executing.  All under our 'mainSession' context */
        next();
    });
});

app.post('/users', (req, res)=> {
    Models.User.create(req.body)
        .then(data=> {
            res.send(data);
        })
        .catch(err=>res.status(500).send(err));
});

app.get('/users', (req, res)=> {
    Models.User.findAll()
        .then(data=> {
            res.send(data);
        })
        .catch(err=>res.status(500).send(err));
});

app.get('/generators', (req, res)=> {
    co(examples.generatorFlow)
        .then(data=> res.send(data));
});

app.get('/users/:id/canceled', function (req, res) {
    Models.User.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: Models.Appointment,
            through: {
                // ignores through model
                attributes: []
            },
            as: 'canceled'
        }]
    }).then(u=> {
        // Handle null result
        res.send(u);
    }).catch(err=> res.status(500).send());

});

app.get('/ping', function (req, res) {
    console.log(context.get('auth'));
    res.send('pong!');
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
