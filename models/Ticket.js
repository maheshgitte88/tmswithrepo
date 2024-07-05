const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Department = require('./Department');
const SubDepartment = require('./SubDepartment');
const User = require('./User');
const TicketUpdate = require('./TicketUpdate');
// const TicketResolution = require('./TicketResolution');
// const QueryCategory = require('./QueryCategory');
// const QuerySubcategory = require('./QuerySubcategory');

const Ticket = sequelize.define('Ticket', {
  TicketID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TicketType: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  TicketQuery: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Status: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,

  },
  CreatedCCMark: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ResolvedCCMark: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  TransferCCMark: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  Querycategory: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  QuerySubcategory: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  TicketResTimeInMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  LeadId: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  claim_User_Id: { // Include EmployeeID field
    type: DataTypes.INTEGER,
    allowNull: true, // Make it nullable if you want to allow tickets without a specific employee
  },
  claimTimestamp: {
    type: DataTypes.DATE,
  },
  tranfclaimTimestamp: {
    type: DataTypes.DATE,
  },
  transferred_Claim_User_id: { // Include EmployeeID field
    type: DataTypes.INTEGER,
    allowNull: true, // Make it nullable if you want to allow tickets without a specific employee
  },
  transferred_Timestamp: {
    type: DataTypes.DATE,
  },
  // closed_User_id: { // Include EmployeeID field
  //   type: DataTypes.INTEGER,
  //   allowNull: true, // Make it nullable if you want to allow tickets without a specific employee
  // },
  closed_Timestamp: {
    type: DataTypes.DATE,
  },
  Resolution_Timestamp: {
    type: DataTypes.DATE,
  },

  TransferDescription: {
    type: DataTypes.TEXT,
  },
  ResolutionDescription: {
    type: DataTypes.TEXT,
  },

  CloseDescription: {
    type: DataTypes.TEXT,
  },
  ResolutionFeedback: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10,
    },
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
  AttachmentUrl: {
    type: DataTypes.JSON, // Store the URL or path to the uploaded file
    allowNull: true,
  },
  ResolvedAttachmentUrl: {
    type: DataTypes.JSON, // Store the URL or path to the uploaded file
    allowNull: true,
  },
  TransferdAttachmentUrl: {
    type: DataTypes.JSON, // Store the URL or path to the uploaded file
    allowNull: true,
  },
});

Ticket.belongsTo(User, { foreignKey: 'user_id', as: 'from_User' });
Ticket.belongsTo(Department, { foreignKey: 'AssignedToDepartmentID', as: 'AssignedToDepartment' });
Ticket.belongsTo(SubDepartment, { foreignKey: 'AssignedToSubDepartmentID', as: 'AssignedToSubDepartment' });
// Ticket.belongsTo(QueryCategory, { foreignKey: 'QuerycategoryID' });
// Ticket.belongsTo(QuerySubcategory, { foreignKey: 'QuerySubcategoryID' });
Ticket.belongsTo(Department, { foreignKey: 'TransferredToDepartmentID', as: 'TransferredToDepartment' });
Ticket.belongsTo(SubDepartment, { foreignKey: 'TransferredToSubDepartmentID', as: 'TransferredToSubDepartment' });
// Ticket.belongsTo(User, { foreignKey: 'claim_User_Id'});
Ticket.belongsTo(User, { foreignKey: 'claim_User_Id', as: 'claim_User' });
Ticket.belongsTo(User, { foreignKey: 'transferred_Claim_User_id', as: 'transferredClaimUser' });
// Ticket.belongsTo(User, { foreignKey: 'closed_User_id', as: 'closed_User' });


// Ticket.belongsTo(Employee, { foreignKey: 'TransferredClaimEmployeeID', as: 'TransferredClaimToEmployee' });


Ticket.hasMany(TicketUpdate, { foreignKey: 'TicketId' });
// Ticket.hasOne(TicketResolution, { foreignKey: 'TicketId' });

module.exports = Ticket;
