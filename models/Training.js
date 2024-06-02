const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const TrainingFeedback = require('./TrainingFeedback');

const Training = sequelize.define('Training', {
    TrainingId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      
      TrainingDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      TrainerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Trainer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      TrainerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      TrainingLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Attendees: {
        type: DataTypes.JSON,
        allowNull: false,
      },
});
Training.hasMany(TrainingFeedback, { foreignKey: 'TrainingId' });

module.exports = Training;
