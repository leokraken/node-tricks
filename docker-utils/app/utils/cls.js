'use strict';

const cls = require('continuation-local-storage');

const CLS_NAME = 'myapp';

function createNamespace() {
  return cls.createNamespace(CLS_NAME);
}

function getNamespace() {
  return cls.getNamespace(CLS_NAME);
}

function get(key) {
  return getNamespace(CLS_NAME).get(key);
}

function set(key, value) {
  getNamespace().set(key, value);
}

module.exports = {
  get: get,
  set: set,
  createNamespace: createNamespace,
  getNamespace: getNamespace
};