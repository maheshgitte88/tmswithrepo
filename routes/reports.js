const express = require("express");
const Ticket = require("../models/Ticket");
const router = express.Router();
const Department = require("../models/Department");
const cron = require('node-cron');
const { Op } = require("sequelize");
const SubDepartment = require("../models/SubDepartment");
const User = require("../models/User");
const ReportTickets = require("../models/Report.js/ReportTickets");
// const sequelize = require("../config");


router.get('/reports', async (req, res) => {
    const { departmentIds, subDepartmentIds, startDate, endDate, statuses, locations, ticketTypes, queryTypes } = req.query;

    // Validate startDate and endDate
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    // Build the where clause conditionally
    let whereClause = {
        createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
        },
    };

    if (departmentIds && departmentIds.length > 0) {
        whereClause.AssignedToDepartmentID = {
            [Op.in]: departmentIds,
        };
    }

    if (subDepartmentIds && subDepartmentIds.length > 0) {
        whereClause.AssignedToSubDepartmentID = {
            [Op.in]: subDepartmentIds,
        };
    }

    if (statuses && statuses.length > 0) {
        whereClause.Status = {
            [Op.in]: statuses,
        };
    }

    if (locations && locations.length > 0) {
        whereClause.location = {
            [Op.in]: locations,
        };
    }

    if (ticketTypes && ticketTypes.length > 0) {
        whereClause.TicketType = {
            [Op.in]: ticketTypes,
        };
    }

    if (queryTypes && queryTypes.length > 0) {
        whereClause.TicketQuery = {
            [Op.in]: queryTypes,
        };
    }

    try {
        const tickets = await Ticket.findAll({
            where: whereClause,
            attributes: [
                "TicketID",
                "TicketType",
                "TicketQuery",
                "Status",
                "Description",
                "Querycategory",
                "QuerySubcategory",
                "TicketResTimeInMinutes",
                "claim_User_Id",
                "claimTimestamp",
                "transferred_Claim_User_id",
                "transferred_Timestamp",
                "closed_Timestamp",
                "Resolution_Timestamp",
                "TransferDescription",
                "ResolutionDescription",
                "CloseDescription",
                "ResolutionFeedback",
                "AssignedToDepartmentID",
                "AssignedToSubDepartmentID",
                "TransferredToDepartmentID",
                "TransferredToSubDepartmentID",
                "createdAt",
                "user_id",
                "claim_User_Id",
                // "actualTAT",
                // "benchmarkPercentage",
                // "benchmarkCategory"
            ],
            include: [
                {
                    model: Department,
                    as: 'AssignedToDepartment',
                    attributes: ['DepartmentName', 'DepartmentID'],
                },
                {
                    model: User,
                    as: "claim_User",
                    attributes: ['user_Name', 'location'],
                },
                {
                    model: SubDepartment,
                    as: "AssignedToSubDepartment",
                    attributes: ['SubDepartmentName', 'SubDepartmentID', 'DepartmentId'],
                },
            ],
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
};

const isWithinWorkingHours = (date) => {
    const startHour = 10;
    const startMinute = 0;
    const endHour = 16;
    const endMinute = 0;

    const hour = date.getHours();
    const minute = date.getMinutes();

    if (hour < startHour || hour > endHour) return false;
    if (hour === startHour && minute < startMinute) return false;
    if (hour === endHour && minute > endMinute) return false;

    return true;
};

const getWorkingMinutes = (start, end) => {
    let totalMinutes = 0;
    let current = new Date(start);

    while (current <= end) {
        if (!isWeekend(current) && isWithinWorkingHours(current)) {
            totalMinutes++;
        }
        current.setMinutes(current.getMinutes() + 1);
    }

    return totalMinutes;
};

const calculateTAT = (createdAt, resolutionTimestamp, ticketResTimeInMinutes) => {
    const start = new Date(createdAt);
    const end = new Date(resolutionTimestamp);

    const totalWorkingMinutes = getWorkingMinutes(start, end);
    const actualTAT = totalWorkingMinutes;
    const benchmarkPercentage = ((actualTAT - ticketResTimeInMinutes) / ticketResTimeInMinutes) * 100;

    let benchmarkCategory;
    if (benchmarkPercentage < 1) {
        benchmarkCategory = "<0 %";
    } else if (benchmarkPercentage <= 20) {
        benchmarkCategory = "1% to 20%";
    } else if (benchmarkPercentage <= 50) {
        benchmarkCategory = "21% to 50%";
    } else if (benchmarkPercentage <= 80) {
        benchmarkCategory = "51% to 80%";
    } else {
        benchmarkCategory = "81% to above";
    }

    return {
        actualTAT,
        benchmarkPercentage,
        benchmarkCategory,
    };
};





async function processTickets() {
    const tickets = await Ticket.findAll({
        // where:{Status:"Resolved"},
        attributes: [
            "TicketID",
            "TicketType",
            "TicketQuery",
            "Status",
            "Description",
            "Querycategory",
            "QuerySubcategory",
            "TicketResTimeInMinutes",
            "claim_User_Id",
            "claimTimestamp",
            "transferred_Claim_User_id",
            "transferred_Timestamp",
            "closed_Timestamp",
            "Resolution_Timestamp",
            "TransferDescription",
            "ResolutionDescription",
            "CloseDescription",
            "ResolutionFeedback",
            "AssignedToDepartmentID",
            "AssignedToSubDepartmentID",
            "TransferredToDepartmentID",
            "TransferredToSubDepartmentID",
            "createdAt",
            "user_id",
            "claim_User_Id",
        ],
        include: [
            {
                model: User,
                as: "claim_User",
                attributes: ['user_id', 'user_Name', 'location'],
            },
            {
                model: Department,
                as: 'AssignedToDepartment',
                attributes: ['DepartmentName', 'DepartmentID'],
            },
            {
                model: SubDepartment,
                as: "AssignedToSubDepartment",
                attributes: ['SubDepartmentName', 'SubDepartmentID', 'DepartmentId'],
            },
            { model: Department, as: "TransferredToDepartment", attributes: ['DepartmentName', 'DepartmentID'] },
            {
                model: SubDepartment, as: "TransferredToSubDepartment", attributes: ['SubDepartmentName', 'SubDepartmentID', 'DepartmentId'],
            },
            {
                model: User,
                as: "transferredClaimUser",
                attributes: ['user_id', 'user_Name', 'location'],
            },


            {
                model: User,
                as: "from_User",
                attributes: ['user_id', 'user_Name', 'location'],
            },
        ],
    });

    for (const ticket of tickets) {
        const { createdAt, Resolution_Timestamp, TicketResTimeInMinutes } = ticket;
        const result = calculateTAT(
            createdAt,
            Resolution_Timestamp,
            TicketResTimeInMinutes
        );

        await ReportTickets.upsert({
            TicketID: ticket.dataValues.TicketID || null,
            TicketType: ticket.dataValues.TicketType || null,
            TicketQuery: ticket.dataValues.TicketQuery || null,
            Status: ticket.dataValues.Status || null,
            Description: ticket.dataValues.Description || null,
            Querycategory: ticket.dataValues.Querycategory || null,
            QuerySubcategory: ticket.dataValues.QuerySubcategory || null,
            TicketResTimeInMinutes: ticket.dataValues.TicketResTimeInMinutes || null,
            closed_Timestamp: ticket.dataValues.closed_Timestamp || null,
            Resolution_Timestamp: ticket.dataValues.Resolution_Timestamp || null,
            closed_Timestamp: ticket.dataValues.closed_Timestamp || null,
            transferred_Timestamp: ticket.dataValues.transferred_Timestamp || null,
            claimTimestamp:ticket.dataValues.claimTimestamp || null,
            ResolutionDescription: ticket.dataValues.ResolutionDescription || null,
            TransferDescription: ticket.dataValues.TransferDescription || null,
            CloseDescription: ticket.dataValues.CloseDescription || null,
            ResolutionFeedback: ticket.dataValues.ResolutionFeedback || null,
            AssignedToDepartmentID: ticket.dataValues.AssignedToDepartmentID || null,
            AssignedToSubDepartmentID: ticket.dataValues.AssignedToSubDepartmentID || null,
            TransferredToDepartmentID: ticket.dataValues.TransferredToDepartmentID || null,
            TransferredToSubDepartmentID: ticket.dataValues.TransferredToSubDepartmentID || null,
            AssignedToDepartmentName: ticket.dataValues.AssignedToDepartment?.dataValues.DepartmentName || null,
            AssignedToSubDepartmentName: ticket.dataValues.AssignedToSubDepartment?.dataValues.SubDepartmentName || null,
            TransferredToDepartmentName: ticket.dataValues.TransferredToDepartment?.dataValues.DepartmentName || null,
            TransferredToSubDepartmentName: ticket.dataValues.TransferredToDepartment?.dataValues.DepartmentName || null,
          
            claim_User_Id: ticket.dataValues.claim_User?.dataValues.user_id || null,
            claim_UserName: ticket.dataValues.claim_User?.dataValues.user_Name || null,
            claim_UserLocation: ticket.dataValues.claim_User?.dataValues.location || null,

            from_User_Id: ticket.dataValues.from_User?.dataValues.user_id || null,
            from_UserName: ticket.dataValues.from_User?.dataValues.user_Name || null,
            from_UserLocation: ticket.dataValues.from_User?.dataValues.location || null,

            Tranf_User_Id: ticket.dataValues.transferredClaimUser?.dataValues.user_id || null,
            Tranf_UserName: ticket.dataValues.transferredClaimUser?.dataValues.user_Name || null,
            Tranf_UserLocation: ticket.dataValues.transferredClaimUser?.dataValues.location || null,

            actualTAT: result.actualTAT,
            benchmarkPercentage: result.benchmarkPercentage,
            benchmarkCategory: result.benchmarkCategory,
            createdAt: ticket.dataValues.createdAt,
        });
    }

}

processTickets()

cron.schedule('0 0 * * *', () => {
    console.log('Running the processTickets function...');
    processTickets()
        .then(() => console.log('Tickets processed successfully.'))
        .catch(err => console.error('Error processing tickets:', err));
});
// router.get('/reports', async (req, res) => {
//     const { departmentId, startDate, endDate, Status, location, ticketType, queryType, subDepartmentId } = req.query;
//     // Validate startDate and endDate
//     if (!startDate || !endDate) {
//         return res.status(400).json({ error: 'startDate and endDate are required' });
//     }

//     // Build the where clause conditionally
//     let whereClause = {
//         createdAt: {
//             [Op.between]: [new Date(startDate), new Date(endDate)]
//         }
//     };

//     if (departmentId) {
//         whereClause.AssignedToDepartmentID = departmentId;
//     }
//     if (subDepartmentId) {
//         whereClause.AssignedToSubDepartmentID = subDepartmentId;
//     }

//     if (Status) {
//         whereClause.Status = Status;
//     }
//     if (location) {
//         whereClause.location = location;
//     }
//     if (ticketType) {
//         whereClause.TicketType = ticketType;
//     }
//     if (queryType) {
//         whereClause.TicketQuery = queryType;
//     }

//     try {
//         const tickets = await Ticket.findAll({
//             where: whereClause,
//             include: [{
//                 model: Department,
//                 as: 'AssignedToDepartment',
//                 attributes: ['DepartmentName', 'DepartmentID']
//             },
//             {
//                 model: User,
//                 as: "claim_User",
//                 attributes: ['user_Name', 'location']
//             },
//             {
//                 model: SubDepartment,
//                 as: "AssignedToSubDepartment",
//                 attributes: ['SubDepartmentName', 'SubDepartmentID', 'DepartmentId']
//             },
//             ]
//         });
//         res.json(tickets);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

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
