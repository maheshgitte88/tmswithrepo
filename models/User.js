const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Department = require('./Department');
const SubDepartment = require('./SubDepartment');
// const TicketResolution = require('./TicketResolution');
// const Ticket = require('./Ticket');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_Name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  user_Roal: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  user_status: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Active',
  },
  user_Mobile: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  user_reg_no: {
    type: DataTypes.STRING(255),
    allowNull: true,
    
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'MIT_Alandi',
  },
  user_Email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  user_Password: {
    type: DataTypes.STRING, // Change the data type based on your security requirements
    allowNull: false,
  },
});

User.belongsTo(Department, { foreignKey: 'DepartmentID' });
User.belongsTo(SubDepartment, { foreignKey: 'SubDepartmentID' });
// Employee.hasMany(Ticket, { foreignKey: 'EmployeeId' });
// Employee.hasMany(Ticket, { foreignKey: 'EmployeeID' });
// Employee.belongsTo(TicketResolution, { foreignKey: 'EmployeeID' });

module.exports = User;
