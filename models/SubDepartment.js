const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const QueryCategory = require('./QueryCategory');

const SubDepartment = sequelize.define('SubDepartment', {
  SubDepartmentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SubDepartmentName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

SubDepartment.hasMany(QueryCategory, { foreignKey: 'SubDepartmentID' });

module.exports = SubDepartment;
