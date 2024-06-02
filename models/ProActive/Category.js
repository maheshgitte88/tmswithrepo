const { DataTypes } = require('sequelize');
const sequelize = require('../../config');
const SubCategory = require('./SubCategory');
// const WorkDetail = require('./WorkDetail');

const Category = sequelize.define('Category', {
  CategoryID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  CategoryName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

Category.hasMany(SubCategory, { foreignKey: 'CategoryId' });
// Category.hasMany(WorkDetail, { foreignKey: 'CategoryId' });

module.exports = Category;
