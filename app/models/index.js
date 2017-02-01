'use strict';

const co = require('co');
const _ = require('lodash');
const knex = require('knex')({
  client: 'pg',
  //debug: true,
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  },
  pool: {min: 0, max: 13}
});

const mysql = require('knex')({
  client: 'mysql',
  //debug: true,
  connection: {
    host: '127.0.0.1',
    user: 'root',
    //password: 'root',
    database: 'mysql'
  },
  pool: {min: 0, max: 10}
});

// Using bookshelf
var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'users',
  appointments: function () {
    return this.belongsToMany(Appointments).through(ScheduledAppointments, 'user_id', 'appointment_id')
  },
  /*
   canceled: function () {
   return this.belongsToMany(Appointments).through(CanceledAppointments);
   }*/
});

var Appointments = bookshelf.Model.extend({
  tableName: 'appointments',
  users: function () {
    return this.belongsToMany(User) //.through(ScheduledAppointments);
  }
});

var CanceledAppointments = bookshelf.Model.extend({
  tableName: 'canceled_appointments',
  user: function () {
    return this.belongsTo(User);
  }
});

var ScheduledAppointments = bookshelf.Model.extend({
  //idAttribute: 'appointment_id',
  tableName: 'scheduled_appointments',
  user: function () {
    return this.belongsTo(User);
  },
  appointment: function () {
    return this.belongsTo(Appointments);
  }
});

/**
 * Create schema
 */
var schema = knex.schema.withSchema('public');
//var schema = mysql.schema.withSchema('mysql');


schema.createTableIfNotExists('users', table => {
  table.increments('id').primary();
  table.string('name');
});

schema.createTableIfNotExists('appointments', table => {
  table.increments('id').primary();
  table.string('description');
});

schema.createTableIfNotExists('canceled_appointments', table => {
  table.integer('appointment_id').references('appointments.id');
  table.integer('user_id').references('users.id');
  table.string('description');
});

schema.createTableIfNotExists('scheduled_appointments', table => {
  table.uuid('id');
  table.integer('appointment_id').references('appointments.id');
  table.integer('user_id').references('users.id');
  table.string('description');
});

schema.then(data=>console.log('schema created...'));

/**
 * Crud functions
 */

/**
 * Find all Users
 * @returns {*}
 */
function findAll() {
  return knex.select().from('users');
}

/**
 * Create user with data 'user'
 * @param {*} user
 * @returns {*}
 */
function create(user) {
  return knex('users')
    .returning('*')
    .insert(user)
    .then(data => {
      return _.head(data);
    });
}


/**
 * Finds user by id
 * @param id
 * @returns {*}
 */
function findById(id) {
  return knex('users')
    .where({
      id: id
    })
    .first();
}

/**
 * Deletes user by id
 * @param id
 * @returns {*}
 */
function deleteById(id) {
  return knex('users')
    .returning('*')
    .where({
      id: id
    })
    .delete();
}

/**
 * Update user with user params (patch)
 * @param id
 * @param user
 * @returns {*}
 */
function update(id, user) {
  return knex('users')
    .returning('*')
    .where({
      id: id
    })
    .update(_.omit(user, ['id']));
}

/**
 * Find canceled appointments for userId
 * @param id
 * @returns {*|void}
 */
function findCanceledAppointmentsByUserId(id) {
  return knex('canceled_appointments')
    .where({user_id: id})
    .select();
}

/**
 * Find user appointments by userId
 * @param id
 * @returns {*|void}
 */
function findAppointmentsByUserId(id) {
  return knex('appointments')
    .where({user_id: id})
    .select();
}

/**
 * Returns appointments from user id
 *
 * Notes: Simplicity, query parallel execution
 * cons: to query calls
 * @param id
 * @returns {*}
 */
var findUserAppointments1 = co.wrap(function * (id) {
  let time = new Date();
  let q = yield {
    user: findById(id),
    canceled: findCanceledAppointmentsByUserId(id),
    appointments: findAppointmentsByUserId(id)
  };

  let final = new Date();
  console.log(time, final, final - time);
  return _.assign(q.users, _.omit(q, ['user']));
});

/**
 * Not simple but make one query to database
 * Complex SQL Query using aggregated functions exclusive by postgresql
 */
var findUserAppointments2 = co.wrap(function * (id) {
  let time = new Date();

  let appointments = yield knex
    .first()
    .select([
      'users.*',
      knex.raw(`COALESCE(json_agg(appointments.*) FILTER (where appointments.id IS NOT NULL), '[]') as appointments`),
      knex.raw(`COALESCE(json_agg(canceled_appointments.*) FILTER (where canceled_appointments.id IS NOT NULL), '[]') as canceled`)]
  )
    .where({
      'users.id': id
    })
    .from('users')
    .leftJoin('appointments', {'appointments.user_id': 'users.id'})
    .leftJoin('canceled_appointments', {'canceled_appointments.user_id': 'users.id'})
    .groupBy('users.id');
  let final = new Date();
  console.log(time, final, final - time);
  return appointments;
});

/** 3
 * Too simple (one line), but the approach its the same of first example, calling 3 queries
 *
 */
var findUserAppointments3 = co.wrap(function * (id) {
  let appointments = yield User.forge({id: id}).fetch({withRelated: ['appointments']});
  return appointments;
});

var findAppointmentUsers = co.wrap(function * (id) {
  let users = yield ScheduledAppointments.forge({
    user_id: 2,
    appointment_id: 1
  }).fetch({withRelated: ['user', 'appointment']});
  return users;
});


/**
 * Mongo
 */
var MongoClient = require('mongodb').MongoClient,
  test = require('assert');
// Connection url
var url = 'mongodb://localhost:27017/test';
// Connect using MongoClient
var mongoDB;
MongoClient.connect(url, function (err, db) {
  console.log(err, db)
  mongoDB = db;
});


function findByIdMongo(id, cb) {
  mongoDB.collection('test', function (err, collection) {
    collection.findOne(cb);
  });
}

module.exports = {
  User: {
    findAll: findAll,
    findById: findById,
    create: create,
    update: update,
    deleteById: deleteById,
    findUserAppointments: findUserAppointments3,
    findByIdMongo: findByIdMongo
  }
};