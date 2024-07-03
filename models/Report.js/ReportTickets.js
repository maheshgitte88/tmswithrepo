// Assuming you have DataTypes initialized as `DataTypes`
const { DataTypes } = require('sequelize');
const sequelize = require('../../config');
const Department = require('../Department');
const User = require('../User');
const SubDepartment = require('../SubDepartment');

const ReportTickets = sequelize.define('ReportTickets', {
  TicketID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TicketType: {
    type: DataTypes.STRING,
  },
  TicketQuery: {
    type: DataTypes.STRING,
  },
  Status: {
    type: DataTypes.STRING,
  },
  Description: {
    type: DataTypes.STRING,
  },
  Querycategory: {
    type: DataTypes.STRING,
  },
  QuerySubcategory: {
    type: DataTypes.STRING,
  },
  TicketResTimeInMinutes: {
    type: DataTypes.INTEGER,
  },
  claim_User_Id: {
    type: DataTypes.INTEGER,
  },
  claimTimestamp: {
    type: DataTypes.DATE,
  },
  transferred_Claim_User_id: {
    type: DataTypes.INTEGER,
  },
  transferred_Timestamp: {
    type: DataTypes.DATE,
  },
  closed_Timestamp: {
    type: DataTypes.DATE,
  },
  Resolution_Timestamp: {
    type: DataTypes.DATE,
  },
  TransferDescription: {
    type: DataTypes.STRING,
  },
  ResolutionDescription: {
    type: DataTypes.STRING,
  },
  CloseDescription: {
    type: DataTypes.STRING,
  },
  ResolutionFeedback: {
    type: DataTypes.STRING,
  },
  AssignedToDepartmentID: {
    type: DataTypes.INTEGER,
  },
  AssignedToSubDepartmentID: {
    type: DataTypes.INTEGER,
  },
  TransferredToDepartmentID: {
    type: DataTypes.INTEGER,
  },
  TransferredToSubDepartmentID: {
    type: DataTypes.INTEGER,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  actualTAT: {
    type: DataTypes.INTEGER,
  },
  benchmarkPercentage: {
    type: DataTypes.FLOAT,
  },
  benchmarkCategory: {
    type: DataTypes.STRING,
  },
});

// Associations
ReportTickets.belongsTo(Department, { foreignKey: 'AssignedToDepartmentID', as: 'AssignedToDepartment' });
ReportTickets.belongsTo(User, { foreignKey: 'claim_User_Id', as: 'claim_User' });
ReportTickets.belongsTo(SubDepartment, { foreignKey: 'AssignedToSubDepartmentID', as: 'AssignedToSubDepartment' });

// Export the Ticket model
module.exports = ReportTickets;
