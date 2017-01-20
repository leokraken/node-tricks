'use strict';

const Models = require('../models/index');
const co = require('co');

function authentication(req, res, next) {

}


function asyncEx(a) {
  return function (cb) {
    setTimeout(function () {
      console.log(a);
      cb(null, 1);
    }, 5000);
  };
}


function asyncEx2(a) {
  return function (cb) {
    console.log(a);
    cb(null, 2);
  };
}


function * generatorFlow2() {
  let a = yield asyncEx(1);
  let a1 = yield asyncEx2(7);
  return a + a1;
}

function * generatorFlow3() {
  let a = yield [asyncEx(1), asyncEx2(7)];
  return a[0] + a[1];
}

function * generatorFlow() {
  let users = yield Models.User.findAll();
  let appointments = yield Models.User.findAll({
    where: {
      name: 'leo2'
    }
  });

  console.log(JSON.stringify(appointments));
  return users;
}

module.exports = {
  auth: authentication,
  generatorFlow: generatorFlow
};