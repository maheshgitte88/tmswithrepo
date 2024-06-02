const { DataTypes } = require("sequelize");
const sequelize = require("../config");
const Department = require("./Department");
const SubDepartment = require("./SubDepartment");
const User = require("./User");

const TicketUpdate = sequelize.define('TicketUpdate', {
    UpdateID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    UpdateStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    UpdateDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    UpdatedAttachmentUrls: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    UpdateTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

});

// TicketUpdate.belongsTo(Ticket, { foreignKey: 'TicketID' });
TicketUpdate.belongsTo(User, { foreignKey: 'user_id' });
TicketUpdate.belongsTo(Department, { foreignKey: 'DepartmentID' });
TicketUpdate.belongsTo(SubDepartment, { foreignKey: 'SubDepartmentID' });

module.exports = TicketUpdate;
