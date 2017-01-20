'use strict';

const Sequelize = require('sequelize');

const connectionStr = 'postgres://postgres:postgres@localhost:5432/postgres';
const sequelize = new Sequelize(connectionStr);



var User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement:true},
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            notAdmin: (value)=>{
                console.log(value);
                if(value==='admin'){
                    throw new Error('Can not be admin');
                }
            }
        }
    }
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



function initDatabase(){
    for(let i=0; i<10; i++){
        User.create({name:'leo'}).then(res=>console.log);
    }
}

sequelize.sync({force:false}).then(data=>{
    //initDatabase();
});

module.exports ={
    User: User,
    Appointment: Appointment
};