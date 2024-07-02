const express = require("express");
const Ticket = require("../models/Ticket");
const router = express.Router();
const Department = require("../models/Department");

const { Op } = require("sequelize");
const SubDepartment = require("../models/SubDepartment");
const User = require("../models/User");
// const sequelize = require("../config");


router.get('/reports', async (req, res) => {
    const { departmentId, startDate, endDate, Status, location, ticketType, queryType, } = req.query;
    // Validate startDate and endDate
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Build the where clause conditionally
    let whereClause = {
        createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        }
    };

    if (departmentId) {
        whereClause.AssignedToDepartmentID = departmentId;
    }

    if (Status) {
        whereClause.Status = Status;
    }
    if (location) {
        whereClause.location = location;
    }
    if (ticketType) {
        whereClause.TicketType = ticketType;
    }
    if (queryType) {
        whereClause.TicketQuery = queryType;
    }

    try {
        const tickets = await Ticket.findAll({
            where: whereClause,
            include: [{
                model: Department,
                as: 'AssignedToDepartment',
                attributes: ['DepartmentName', 'DepartmentID']
            },
            {
                model: User,
                as: "claim_User",
                attributes: ['user_Name', 'location']
            },
            {
                model: SubDepartment,
                as: "AssignedToSubDepartment",
                attributes: ['SubDepartmentName', 'SubDepartmentID', 'DepartmentId']
            },
            ]
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/departmentsforreport', async (req, res) => {
    try {
        const departments = await Department.findAll({
            attributes: ['DepartmentID', 'DepartmentName'], // Ensure only required fields are fetched
            include: [{
                model: SubDepartment,
                attributes: ['SubDepartmentName', 'SubDepartmentID', 'DepartmentId']
            }]
        });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
