const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const TrainingFeedback = sequelize.define("TrainingFeedback", {
  FeedbackId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  EmployeeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  EmployeeEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Feedback: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
  ReviewDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

module.exports = TrainingFeedback;
