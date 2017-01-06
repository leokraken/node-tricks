const Sequelize = require('sequelize');

const connectionStr = 'postgres://postgres:postgres@localhost:5432/postgres';
const sequelize = new Sequelize(connectionStr);



var User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true},
    name: Sequelize.STRING
},{
    timestamps: false
});

var Appointment = sequelize.define('appointment', {
    id: { type: Sequelize.INTEGER, primaryKey: true},
    description: Sequelize.STRING
},{
    timestamps: false
});

var UserAppointment = sequelize.define('user_appointments', {
    userid: { type: Sequelize.INTEGER},
    appointmentid: { type: Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true
});

var UserAppointmentCanceled = sequelize.define('user_appointments_canceled', {
    userid: { type: Sequelize.INTEGER},
    appointmentid: { type: Sequelize.INTEGER}
},{
    timestamps: false,
    freezeTableName: true
});

Appointment.belongsToMany(User, {through: UserAppointment, foreignKey:'appointmentid'});
User.belongsToMany(Appointment, {through: UserAppointment, foreignKey:'userid'});

Appointment.belongsToMany(User, {as: 'canceled', through: UserAppointmentCanceled, foreignKey:'appointmentid'});
User.belongsToMany(Appointment, {as: 'canceled', through: UserAppointmentCanceled, foreignKey:'userid'});


sequelize.sync().then(data=>{
    //console.log(err);
});

module.exports ={
    User: User,
    Appointment: Appointment
};