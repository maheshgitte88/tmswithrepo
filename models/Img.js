const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Img = sequelize.define('Img', {
    ImgID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    AttachmentUrl: {
      type: DataTypes.JSON, 
      allowNull: true,
    },
  });

  module.exports = Img;
