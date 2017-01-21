'use strict';

const co = require('co');
const _ = require('lodash');
const knex = require('knex')({
  client: 'pg',
  debug: true,
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  },
  pool: {min: 0, max: 10}
});

/**
 * Create schema
 */
var schema = knex.schema.withSchema('public');

schema.createTableIfNotExists('users', table => {
  table.increments('id');
  table.string('name');
});

schema.createTableIfNotExists('appointments', table => {
  table.increments('id');
  table.integer('user_id');
  table.string('description');
});

schema.createTableIfNotExists('canceled_appointments', table => {
  table.increments('id');
  table.integer('user_id');
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
function findCanceledAppointmentsByUserId (id){
  return knex('canceled_appointments')
    .where({user_id: id})
    .select();
}

/**
 * Find user appointments by userId
 * @param id
 * @returns {*|void}
 */
function findAppointmentsByUserId (id){
  return knex('appointments')
    .where({user_id: id})
    .select();
}

/**
 * Returns appointments from user id
 * @param id
 * @returns {*}
 */
var findUserAppointments = co.wrap(function * (id) {
  let appointments = yield {
    canceled: findCanceledAppointmentsByUserId(id),
    appointments: findAppointmentsByUserId(id)
  };

  return appointments;
});


module.exports = {
  User: {
    findAll: findAll,
    findById: findById,
    create: create,
    update: update,
    deleteById: deleteById,
    findUserAppointments: findUserAppointments
  }
};