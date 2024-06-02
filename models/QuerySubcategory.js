const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const QuerySubcategory = sequelize.define('QuerySubcategory', {
    QuerySubCategoryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    QuerySubcategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TimeInMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = QuerySubcategory;
