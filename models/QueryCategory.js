const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const QuerySubcategory = require('./QuerySubcategory');

const QueryCategory = sequelize.define('QueryCategory', {
    QueryCategoryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    QueryCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}
);
QueryCategory.hasMany(QuerySubcategory, { foreignKey: 'QueryCategoryId' });
module.exports = QueryCategory;
