const { DataTypes } = require('sequelize');
const sequelize = require('../../config');
// const Department = require('../Department');


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
  // transferred_Claim_User_id: {
  //   type: DataTypes.INTEGER,
  // },
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
  AssignedToDepartmentName: {
    type: DataTypes.STRING,
  },
  AssignedToSubDepartmentName: {
    type: DataTypes.STRING,
  },
  TransferredToDepartmentName: {
    type: DataTypes.STRING,
  },
  TransferredToSubDepartmentName: {
    type: DataTypes.STRING,
  },
  claim_UserName: {
    type: DataTypes.STRING,
  },
  claim_UserLocation: {
    type: DataTypes.STRING,
  },
  from_User_Id: {
    type: DataTypes.INTEGER,
  },
  from_UserName: {
    type: DataTypes.STRING,
  },
  from_UserLocation: {
    type: DataTypes.STRING,
  },
  from_User_Id: {
    type: DataTypes.INTEGER,
  },
  from_UserName: {
    type: DataTypes.STRING,
  },
  from_UserLocation: {
    type: DataTypes.STRING,
  },
  Tranf_User_Id: {
    type: DataTypes.INTEGER,
  },
  Tranf_UserName: {
    type: DataTypes.STRING,
  },
  Tranf_UserLocation: {
    type: DataTypes.STRING,
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
  createdAt: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: false,
});

// Export the ReportTickets model
module.exports = ReportTickets;
