const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const SubDepartment = require('./SubDepartment');
const QueryCategory = require('./QueryCategory');

const Department = sequelize.define('Department', {
  DepartmentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  DepartmentName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});
Department.hasMany(SubDepartment, { foreignKey: 'DepartmentId' });
Department.hasMany(QueryCategory, { foreignKey: 'DepartmentId' });

module.exports = Department;
