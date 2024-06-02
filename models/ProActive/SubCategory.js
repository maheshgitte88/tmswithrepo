const { DataTypes } = require('sequelize');
const sequelize = require('../../config');
// const WorkDetail = require('./WorkDetail');
// const Category = require('./category');

const SubCategory = sequelize.define('SubCategory', {
  SubCategoryID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SubCategoryName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  CategoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Categories',
      key: 'CategoryID',
    },
  },
});

// SubCategory.hasMany(WorkDetail, { foreignKey: 'SubCategoryId' });
// SubCategory.belongsTo(Category, { foreignKey: 'CategoryId' });

module.exports = SubCategory;
  