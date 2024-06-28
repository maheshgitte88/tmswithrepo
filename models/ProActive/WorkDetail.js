const { DataTypes } = require('sequelize');
const sequelize = require('../../config');
const Category = require('./Category');
const SubCategory = require('./SubCategory');

const WorkDetail = sequelize.define('WorkDetail', {
  WorkDetailID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SelectLocation: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  SelectSource: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  FromName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  SelectDepartment: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Query: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  Action: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ReceivedTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  SolvedTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  TAT: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Status: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  //   SelectStatus: {
  //     type: DataTypes.STRING(255),
  //     allowNull: false,
  //   },
  TicketType: {
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
  SubCategoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'SubCategories',
      key: 'SubCategoryID',
    },
  },
});

WorkDetail.belongsTo(Category, { foreignKey: 'CategoryId' });
WorkDetail.belongsTo(SubCategory, { foreignKey: 'SubCategoryId' });

module.exports = WorkDetail;
