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
var findUserAppointments2 = co.wrap(function * (id) {
  let time = new Date();
  let appointments = yield {
    canceled: findCanceledAppointmentsByUserId(id),
    appointments: findAppointmentsByUserId(id)
  };

  let final = new Date();
  console.log(time, final, final - time);
  return appointments;
});

/**
 * Not simple but make one query to database
 * Complex SQL Query using aggregated functions exclusive by postgresql
 */
var findUserAppointments = co.wrap(function * (id) {
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