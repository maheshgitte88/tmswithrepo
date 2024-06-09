const express = require("express");
const User = require("../models/User");
const Ticket = require("../models/Ticket");
const router = express.Router();
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Department = require("../models/Department");
const SubDepartment = require("../models/SubDepartment");
const TicketUpdate = require("../models/TicketUpdate");
const sendEmail = require("../sendEmail");
const { Op } = require("sequelize");
// const TicketResolution = require("../models/TicketResolution");

const validateRequest = async (req, res, next) => {
  // Extract the JWT token from the Authorization header
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Token not provided" });
  }

  const token = authorizationHeader.split(" ")[1];
  console.log(token, 14);
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user making the request exists
    const userId = decoded.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If validation passes, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error("Error validating request:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Create ticket API endpoint
// router.post("/create-ticket", validateRequest, async (req, res) => {
//     try {
//         // Create ticket using request body data
//         const ticket = await Ticket.create(req.body);
//         res.status(201).json({ success: true, ticket });
//     } catch (error) {
//         console.error("Error creating ticket:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// });

// POST /api/create-ticket

router.post("/create-ticket", async (req, res) => {
  try {
    // Create a new ticket using the data from the request body
    const ticket = await Ticket.create(req.body);
    // Fetch the created ticket with all associated models' data
    const createdTicket = await Ticket.findOne({
      where: { TicketID: ticket.TicketID }, // Use the ID of the created ticket to fetch it
      include: [
        {
          model: User,
          as: "claim_User",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        }, // Include claim user information
        {
          model: User,
          as: "transferredClaimUser",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        }, // Include transferred claim user information
        { model: Department, as: "AssignedToDepartment" }, // Include assigned department information
        { model: SubDepartment, as: "AssignedToSubDepartment" }, // Include assigned sub department information
        { model: Department, as: "TransferredToDepartment" }, // Include transferred department information
        { model: SubDepartment, as: "TransferredToSubDepartment" }, // Include transferred sub department information
        { model: TicketUpdate }, // Include ticket updates
        // { model: TicketResolution }, // Include ticket resolution
        {
          model: User,
          as: "from_User",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        },
        // Add other associations as needed
      ],
    });
    res.status(201).json({ success: true, ticket: createdTicket });
    // sendEmailToAll(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Export the createTicket function for Socket.io usage
async function createTicket(data) {
  const { formData } = data;
  // Create a new ticket using the data from the request
  const ticket = await Ticket.create(formData);
  // Fetch the created ticket with all associated models' data
  const createdTicket = await Ticket.findOne({
    where: { TicketID: ticket.TicketID },
    include: [
      {
        model: User,
        as: "claim_User",
        include: [{ model: Department, include: [SubDepartment] }],
      },
      {
        model: User,
        as: "transferredClaimUser",
        include: [{ model: Department, include: [SubDepartment] }],
      },
      { model: Department, as: "AssignedToDepartment" },
      { model: SubDepartment, as: "AssignedToSubDepartment" },
      { model: Department, as: "TransferredToDepartment" },
      { model: SubDepartment, as: "TransferredToSubDepartment" },
      { model: TicketUpdate },
      {
        model: User,
        as: "from_User",
        include: [{ model: Department, include: [SubDepartment] }],
      },
    ],
  });
  sendEmailToAll(createdTicket);
  return createdTicket;
}

// async function sendEmailToAll(data){
//   // sendEmail()

//   console.log(data, 112);
//   sendEmail(
//     'maheshgitte88@gmail.com',
//     'Test Subject',
//     'Hello, this is a test email!',
//     '<b>Hello, this is a test email!</b>'
//   );
// }

const sendEmailToAll = async (data) => {
  try {
    const {
      AssignedToDepartmentID,
      AssignedToSubDepartmentID,
      TicketID,
      Description,
      TicketResTimeInMinutes,
      user_id,
      LeadId,
      Querycategory,
      QuerySubcategory,
      ResolutionDescription,
      TransferDescription,
      CreatedCCMark,
      ResolvedCCMark,
      TransferCCMark,
    } = data.dataValues;

    const users = await User.findAll({
      where: {
        SubDepartmentID: AssignedToSubDepartmentID,
        user_status: "Active",
      },
      attributes: ["user_Email", "user_Name"],
    });

    if (users.length === 0) {
      console.log("No users found in the specified department.");
      return;
    }

    const createdUser = await User.findOne({
      where: {
        user_id: user_id,
        user_status: "Active",
      },
      attributes: ["user_Email", "user_Name", "user_Roal"],
    });

    if (!createdUser) {
      console.log("No users found in the specified user_id.");
      return;
    }

    const emailBodyUser = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <p>Dear ${createdUser.user_Name},</p>
    <p>Greetings for the day...!</p>
    <p>This email is to inform you that your ticket has been generated successfully.</p>
    <h3 style="color: #004080;">Ticket Details:</h3>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Category</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Querycategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Subcategory</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${QuerySubcategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">CC Mark</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${CreatedCCMark}</td>
      </tr>
    </table>
    <p>We sincerely thank you for your patience!</p>
    <p>Please do not reply to this email, as this is a system-generated email.</p>
    <p>Regards,</p>
    <p>Team MIT-School of Distance Education</p>
    <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
  </div>
    `;

    const emailForStudent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <p>Dear ${createdUser.user_Name},</p>
    <p>Greetings for the day...!</p>
    <p>This email is to inform you that your ticket has been generated successfully.</p>
    <h3 style="color: #004080;">Ticket Details:</h3>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
      </tr>

      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
      </tr>
      <tr>
      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Student Name</td>
      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${createdUser.user_Name}</td>
    </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
      </tr>
    </table>
    <p>We sincerely thank you for your patience!</p>
    <p>Please do not reply to this email, as this is a system-generated email.</p>
    <p>Regards,</p>
    <p>Team MIT-School of Distance Education</p>
    <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
  </div>
    `;

    const emailBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <p>Dear ${users.user_Name},</p>
    <p>Greetings for the day...!</p>
    <p>This email is to inform you that your ticket has been generated successfully.</p>
    <h3 style="color: #004080;">Ticket Details:</h3>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Category</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Querycategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Subcategory</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${QuerySubcategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">CC Mark</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${CreatedCCMark}</td>
      </tr>
    </table>
    <p>We sincerely thank you for your patience!</p>
    <p>Please do not reply to this email, as this is a system-generated email.</p>
    <p>Regards,</p>
    <h4>Team MIT-School of Distance Education</h4>
    <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
  </div>
    `;

    const emailBodyLead = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <p>Dear ${createdUser.user_Name},</p>
    <p>Greetings for the day...!</p>
    <p>This email is to inform you that your ticket has been generated successfully.</p>
    <h3 style="color: #004080;">Ticket Details:</h3>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Category</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Querycategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Subcategory</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${QuerySubcategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">CC Mark</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${CreatedCCMark}</td>
      </tr>
    </table>
    <p>We sincerely thank you for your patience!</p>
    <p>Please do not reply to this email, as this is a system-generated email.</p>
    <p>Regards,</p>
    <p>Team MIT-School of Distance Education</p>
    <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
  </div>
    `;

    if (createdUser.user_Roal === "Student") {
      sendEmail(
        createdUser.user_Email,
        `Ticket ID: ${TicketID} - Ticket Generated Successfully`,
        CreatedCCMark,
        emailForStudent
      );
    } else {
      sendEmail(
        createdUser.user_Email,
        `Ticket ID: ${TicketID} - Ticket Generated Successfully`,
        CreatedCCMark,
        emailBodyUser
      );
    }

    if (LeadId) {
      if (LeadId && Querycategory && QuerySubcategory) {
        users.forEach((user) => {
          sendEmail(
            user.user_Email,
            `Ticket ID: ${LeadId} Received From ${createdUser.user_Name}`,
            CreatedCCMark,
            `
            <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Dear ${user.user_Name},</p>
      <p>Greetings for the day...!</p>
      <p>This email is to inform you that your ticket has been generated successfully.</p>
      <h3 style="color: #004080;">Ticket Details:</h3>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        <tr>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Category</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Querycategory}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Subcategory</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${QuerySubcategory}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">CC Mark</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${CreatedCCMark}</td>
        </tr>
      </table>
      <p>We sincerely thank you for your patience!</p>
      <p>Please do not reply to this email, as this is a system-generated email.</p>
      <p>Regards,</p>
      <p>Team MIT-School of Distance Education</p>
      <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
    </div>
            `
          );
        });
      } else {
        users.forEach((user) => {
          sendEmail(
            user.user_Email,
            `Ticket ID: ${LeadId} Received From ${createdUser.user_Name}`,
            CreatedCCMark,
            `
            <div style="font-family: Arial, sans-serif; color: #333;">
      <p>Dear ${user.user_Name},</p>
      <p>Greetings for the day...!</p>
      <p>This email is to inform you that your ticket has been generated successfully.</p>
      <h3 style="color: #004080;">Ticket Details:</h3>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        <tr>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
          <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Category</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Extraaedge</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Subcategory</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Lead Transfer</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">CC Mark</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${CreatedCCMark}</td>
        </tr>
      </table>
      <p>We sincerely thank you for your patience!</p>
      <p>Please do not reply to this email, as this is a system-generated email.</p>
      <p>Regards,</p>
      <p>Team MIT-School of Distance Education</p>
      <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
    </div>
            `
          );
        });
      }
    } else {
      users.forEach((user) => {
        sendEmail(
          user.user_Email,
          `Ticket ID: ${TicketID} Received From ${createdUser.user_Name}`,
          CreatedCCMark,
          `
          <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Dear ${user.user_Name},</p>
          <p>Greetings for the day...!</p>
          <p>This email is to inform you that your ticket has been generated successfully.</p>
          <h3 style="color: #004080;">Ticket Details:</h3>
          <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
            <tr>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
            </tr>
            <tr>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
            </tr>
                    <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Category</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Querycategory}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Subcategory</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${QuerySubcategory}</td>
        </tr>
            <tr>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">CC Mark</td>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${CreatedCCMark}</td>
            </tr>
          </table>
          <p>We sincerely thank you for your patience!</p>
          <p>Please do not reply to this email, as this is a system-generated email.</p>
          <p>Regards,</p>
          <h4>Team MIT-School of Distance Education</h4>
          <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
        </div>
          `
        );
      });
    }

    console.log("Emails have been sent to all users in the department.");
  } catch (error) {
    console.error("Error fetching users or sending emails: %s", error);
  }
};

// const sendEmailToAll = async (data) => {
//   try {
//     const {
//       // AssignedToDepartmentID,
//       AssignedToSubDepartmentID,
//       TicketID,
//       Description,
//       TicketResTimeInMinutes,
//       user_id,
//       LeadId,
//       Querycategory,
//       QuerySubcategory,
//       ResolutionDescription,
//       TransferDescription,
//       CreatedCCMark,
//       ResolvedCCMark,
//       TransferCCMark

//     } = data.dataValues;

//     // Fetch users in the specified department
//     const users = await User.findAll({
//       where: {
//         SubDepartmentID: AssignedToSubDepartmentID,
//         user_status: "Active", // Ensure only active users are considered
//       },
//       attributes: ["user_Email", "user_Name"], // Only fetch the email addresses
//     });

//     if (users.length === 0) {
//       console.log("No users found in the specified department.");
//       return;
//     }

//     const createdUser = await User.findOne({
//       where: {
//         user_id: user_id,
//         user_status: "Active", // Ensure only active users are considered
//       },
//       attributes: ["user_Email", "user_Name"], // Only fetch the email addresses
//     });

//     if (createdUser.length === 0) {
//       console.log("No users found in the specified user_id.");
//       return;
//     }

//     // user.forEach(user => {
//     sendEmail(
//       createdUser.user_Email,
//       `${TicketID} Genrated...!`,
//       "Hello, this is a test email!",
//       `<b>Hello,  ${Description} </b>`
//     );
//     // });

//     // Send email to each user
//     users.forEach((user) => {
//       sendEmail(
//         user.user_Email,
//         `Ticket with ${TicketID} Recived From ${createdUser.user_Name}`,
//         "Hello, this is a test email!",
//         `<b>Hello,  ${Description} </b>`
//       );
//     });

//     if(LeadId){
//       users.forEach((user) => {
//         sendEmail(
//           user.user_Email,
//           `Ticket with ${LeadId} Recived From ${createdUser.user_Name}`,
//           "Hello, this is a test email!",
//           `<b>Hello,  ${Description} </b>`
//         );
//       });
//     }

//     console.log("Emails have been sent to all users in the department.");
//   } catch (error) {
//     console.error("Error fetching users or sending emails: %s", error);
//   }
// };

router.post("/update-ticket", async (req, res) => {
  try {
    const { TicketID, ...ticketData } = req.body;

    // Find the ticket by TicketID
    const ticket = await Ticket.findOne({
      where: { TicketID },
    });

    if (ticket) {
      // Update the ticket with the received data
      await ticket.update(ticketData);

      // Fetch the updated ticket with all associated models' data
      const updatedTicket = await Ticket.findOne({
        where: { TicketID: ticket.TicketID },
        include: [
          {
            model: User,
            as: "claim_User",
            include: [
              { model: Department, include: [{ model: SubDepartment }] },
            ],
          }, // Include claim user information
          {
            model: User,
            as: "transferredClaimUser",
            include: [
              { model: Department, include: [{ model: SubDepartment }] },
            ],
          }, // Include transferred claim user information
          { model: Department, as: "AssignedToDepartment" }, // Include assigned department information
          { model: SubDepartment, as: "AssignedToSubDepartment" }, // Include assigned sub department information
          { model: Department, as: "TransferredToDepartment" }, // Include transferred department information
          { model: SubDepartment, as: "TransferredToSubDepartment" }, // Include transferred sub department information
          { model: TicketUpdate }, // Include ticket updates
          {
            model: User,
            as: "from_User",
            include: [
              { model: Department, include: [{ model: SubDepartment }] },
            ],
          },
        ],
      });

      // Emit a 'updatedDeptTicketChat' event to notify clients about the updated ticket
      // req.io.emit("updatedDeptTicketChat", updatedTicket);

      // Send success response with the updated ticket
      res.status(200).json({ success: true, ticket: updatedTicket });
    } else {
      // Send error response if the ticket was not found
      res.status(404).json({ success: false, message: "Ticket not found" });
    }
  } catch (error) {
    console.error("Error updating ticket:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

async function updateTicket(data) {
  try {
    console.log(data, 262);
    const { TicketID, ...ticketData } = data.formData;

    // Find the ticket by TicketID
    const ticket = await Ticket.findOne({
      where: { TicketID },
    });

    if (ticket) {
      // Update the ticket with the received data
      await ticket.update(ticketData);

      // Fetch the updated ticket with all associated models' data
      const updatedTicket = await Ticket.findOne({
        where: { TicketID: ticket.TicketID },
        include: [
          {
            model: User,
            as: "claim_User",
            include: [
              { model: Department, include: [{ model: SubDepartment }] },
            ],
          }, // Include claim user information
          {
            model: User,
            as: "transferredClaimUser",
            include: [
              { model: Department, include: [{ model: SubDepartment }] },
            ],
          }, // Include transferred claim user information
          { model: Department, as: "AssignedToDepartment" }, // Include assigned department information
          { model: SubDepartment, as: "AssignedToSubDepartment" }, // Include assigned sub department information
          { model: Department, as: "TransferredToDepartment" }, // Include transferred department information
          { model: SubDepartment, as: "TransferredToSubDepartment" }, // Include transferred sub department information
          { model: TicketUpdate }, // Include ticket updates
          {
            model: User,
            as: "from_User",
            include: [
              { model: Department, include: [{ model: SubDepartment }] },
            ],
          },
        ],
      });

      // Emit a 'updatedDeptTicketChat' event to notify clients about the updated ticket
      // req.io.emit("updatedDeptTicketChat", updatedTicket);
      sendUpdatedEmailToAll(updatedTicket);
      return updatedTicket;
      // Send success response with the updated ticket
      // res.status(200).json({ success: true, ticket: updatedTicket });
    } else {
      // Send error response if the ticket was not found
      res.status(404).json({ success: false, message: "Ticket not found" });
    }
  } catch (error) {
    console.error("Error updating ticket:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
const sendUpdatedEmailToAll = async (data) => {
  try {
    const {
      AssignedToDepartmentID,
      AssignedToSubDepartmentID,
      TicketID,
      Description,
      TicketResTimeInMinutes,
      user_id,
      LeadId,
      Status,
      Querycategory,
      QuerySubcategory,
      ResolutionDescription,
      TransferDescription,
      CreatedCCMark,
      ResolvedCCMark,
      TransferCCMark,
    } = data.dataValues;

    const users = await User.findAll({
      where: {
        SubDepartmentID: AssignedToSubDepartmentID,
        user_status: "Active",
      },
      attributes: ["user_Email", "user_Name"],
    });

    if (users.length === 0) {
      console.log("No users found in the specified department.");
      return;
    }

    const emailBodyUser = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <p>Dear ${createdUser.user_Name},</p>
    <p>Greetings for the day...!</p>
    <p>This email is to inform you that your ticket has been generated successfully.</p>
    <h3 style="color: #004080;">Ticket Details:</h3>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Category</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Querycategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Subcategory</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${QuerySubcategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
      </tr>
      <tr>
      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Resolved Description </td>
      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${ResolutionDescription}</td>
    </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">CC Mark</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${CreatedCCMark}</td>
      </tr>
    </table>
    <p>We sincerely thank you for your patience!</p>
    <p>Please do not reply to this email, as this is a system-generated email.</p>
    <p>Regards,</p>
    <p>Team MIT-School of Distance Education</p>
    <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
  </div>
    `;

    const emailBodyUserTranf = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <p>Dear ${createdUser.user_Name},</p>
    <p>Greetings for the day...!</p>
    <p>This email is to inform you that your ticket has been generated successfully.</p>
    <h3 style="color: #004080;">Ticket Details:</h3>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Ticket ID</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TicketID}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Category</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Querycategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Query Subcategory</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${QuerySubcategory}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Description</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${Description}</td>
      </tr>
      <tr>
      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Resolved Description </td>
      <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${TransferDescription}</td>
    </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">CC Mark</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${CreatedCCMark}</td>
      </tr>
    </table>
    <p>We sincerely thank you for your patience!</p>
    <p>Please do not reply to this email, as this is a system-generated email.</p>
    <p>Regards,</p>
    <p>Team MIT-School of Distance Education</p>
    <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
  </div>
    `;

    const createdUser = await User.findOne({
      where: {
        user_id: user_id,
        user_status: "Active",
      },
      attributes: ["user_Email", "user_Name", "user_Roal"],
    });

    if (TransferDescription && Status === "Resolved") {
      sendEmail(
        createdUser.user_Email,
        `Ticket ID: ${TicketID} - Ticket Resolved`,
        CreatedCCMark,
        emailBodyUserTranf
      );
    } else if (Status === "Resolved") {
      sendEmail(
        createdUser.user_Email,
        `Ticket ID: ${TicketID} - Ticket Resolved`,
        CreatedCCMark,
        emailBodyUser
      );
    }
  } catch (error) {
    console.log(error);
  }
};

async function claimTicket(data) {
  try {
    const { TicketID, user_id } = data.formData;

    // const ticketId = req.params.id;
    // const { claim_User_Id } = req.body; // Assume the ID of the claiming user is sent in the request body
    console.log(TicketID, user_id);
    // Update the ticket to be claimed by the user
    const ticket = await Ticket.update(
      { claim_User_Id: user_id },
      { where: { TicketID: TicketID } }
    );

    if (ticket[0] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    // Find the updated ticket with all necessary associations
    const updatedTicket = await Ticket.findOne({
      where: { TicketID: TicketID },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        },
      ],
    });
    return updatedTicket;
  } catch (error) {
    console.error("Error claiming ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function transfclaimTicket(data) {
  try {
    const { TicketID, user_id } = data.formData;

    // const ticketId = req.params.id;
    // const { claim_User_Id } = req.body; // Assume the ID of the claiming user is sent in the request body
    console.log(TicketID, user_id);
    // Update the ticket to be claimed by the user
    const ticket = await Ticket.update(
      { transferred_Claim_User_id: user_id },
      { where: { TicketID: TicketID } }
    );

    if (ticket[0] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    // Find the updated ticket with all necessary associations
    const updatedTicket = await Ticket.findOne({
      where: { TicketID: TicketID },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [{ model: Department, include: [{ model: SubDepartment }] }],
        },
      ],
    });
    return updatedTicket;
  } catch (error) {
    console.error("Error claiming ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// router.post("/create-ticket", async (req, res) => {
//     try {
//       // Create a new ticket using the data from the request body
//       const ticket = await Ticket.create(req.body);

//       // Emit a 'newTicket' event to notify clients about the newly created ticket
//       req.io.emit('newTicket', ticket);

//       res.status(201).json({ success: true, ticket });
//     } catch (error) {
//       console.error("Error creating ticket:", error);
//       res.status(500).json({ success: false, message: "Internal server error" });
//     }
//   });

//Tickets less than 24h

router.get("/tickets/:departmentId/:SubDepartmentId", async (req, res) => {
  try {
    // Extract departmentId and subDepartmentId from request parameters
    const departmentId = req.params.departmentId;
    const subDepartmentId = req.params.SubDepartmentId;

    // Fetch tickets from the database where claim_User_Id is null and filter by department and sub-department IDs
    const tickets = await Ticket.findAll({
      where: {
        AssignedToDepartmentID: departmentId,
        AssignedToSubDepartmentID: subDepartmentId,
        claim_User_Id: {
          [Op.is]: null,
        },
      },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [
                {
                  model: SubDepartment,
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [
                {
                  model: SubDepartment,
                },
              ],
            },
          ],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [
                {
                  model: SubDepartment,
                },
              ],
            },
          ],
        },
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Tickets in between 24h to 48 h

// Tickets above 48h

// router.get("/tickets/:departmentId/:SubDepartmentId", async (req, res) => {
//   try {
//     // Extract departmentId and subDepartmentId from request parameters
//     const departmentId = req.params.departmentId;
//     const subDepartmentId = req.params.SubDepartmentId;

//     // Fetch tickets from the database where claim_User_Id is null and filter by department and sub-department IDs
//     const tickets = await Ticket.findAll({
//       where: {
//         AssignedToDepartmentID: departmentId,
//         AssignedToSubDepartmentID: subDepartmentId,
//         claim_User_Id: {
//           [Op.is]: null,
//         },
//       },
//       include: [
//         {
//           model: User,
//           as: "claim_User",
//           include: [
//             {
//               model: Department,
//               include: [{ model: SubDepartment }],
//             },
//           ],
//         },
//         {
//           model: User,
//           as: "transferredClaimUser",
//           include: [
//             {
//               model: Department,
//               include: [{ model: SubDepartment }],
//             },
//           ],
//         },
//         { model: Department, as: "AssignedToDepartment" },
//         { model: SubDepartment, as: "AssignedToSubDepartment" },
//         { model: Department, as: "TransferredToDepartment" },
//         { model: SubDepartment, as: "TransferredToSubDepartment" },
//         { model: TicketUpdate },
//         {
//           model: User,
//           as: "from_User",
//           include: [
//             {
//               model: Department,
//               include: [{ model: SubDepartment }],
//             },
//           ],
//         },
//       ],
//     });

//     // Send success response with the retrieved tickets
//     res.status(200).json({ success: true, tickets });
//   } catch (error) {
//     console.error("Error fetching tickets:", error);
//     // Send error response if an error occurs
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

// router.get("/tickets/:departmentId/:SubDepartmentId", async (req, res) => {
//   try {
//     // Fetch all tickets from the database and include associated models' data
//     const departmentId = req.params.departmentId;
//     const subDepartmentId = req.params.SubDepartmentId;

//     const tickets = await Ticket.findAll({
//       where: {
//         AssignedToDepartmentID: departmentId,
//         AssignedToSubDepartmentID: subDepartmentId,
//       },
//       // where: { user_id: 2, Status: "Pending" },
//       include: [
//         {
//           model: User,
//           as: "claim_User",
//           include: [
//             {
//               model: Department,
//               include: [{ model: SubDepartment }],
//             },
//           ],
//         }, // Include claim user information
//         {
//           model: User,
//           as: "transferredClaimUser",
//           include: [
//             {
//               model: Department,
//               include: [{ model: SubDepartment }],
//             },
//           ],
//         }, // Include transferred claim user information
//         { model: Department, as: "AssignedToDepartment" }, // Include assigned department information
//         { model: SubDepartment, as: "AssignedToSubDepartment" }, // Include assigned sub department information
//         { model: Department, as: "TransferredToDepartment" }, // Include transferred department information
//         { model: SubDepartment, as: "TransferredToSubDepartment" }, // Include transferred sub department information
//         { model: TicketUpdate }, // Include ticket updates
//         // { model: TicketResolution }, // Include ticket resolution
//         {
//           model: User,
//           as: "from_User",
//           include: [
//             {
//               model: Department,
//               include: [{ model: SubDepartment }],
//             },
//           ],
//         },
//         // Add other associations as needed
//       ],
//     });

//     // Send success response with the retrieved tickets
//     res.status(200).json({ success: true, tickets });
//   } catch (error) {
//     console.error("Error fetching tickets:", error);
//     // Send error response if an error occurs
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

router.get("/trs-tickets/:departmentId/:SubDepartmentId", async (req, res) => {
  try {
    // Fetch all tickets from the database and include associated models' data
    const departmentId = req.params.departmentId;
    const subDepartmentId = req.params.SubDepartmentId;

    const tickets = await Ticket.findAll({
      where: {
        TransferredToDepartmentID: departmentId,
        TransferredToSubDepartmentID: subDepartmentId,
        transferred_Claim_User_id: null,
      },
      // where: { user_id: 2, Status: "Pending" },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        }, // Include claim user information
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        }, // Include transferred claim user information
        { model: Department, as: "AssignedToDepartment" }, // Include assigned department information
        { model: SubDepartment, as: "AssignedToSubDepartment" }, // Include assigned sub department information
        { model: Department, as: "TransferredToDepartment" }, // Include transferred department information
        { model: SubDepartment, as: "TransferredToSubDepartment" }, // Include transferred sub department information
        { model: TicketUpdate }, // Include ticket updates
        // { model: TicketResolution }, // Include ticket resolution
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        // Add other associations as needed
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/tickets/:user_id", async (req, res) => {
  try {
    // Fetch all tickets from the database and include associated models' data
    const user_id = req.params.user_id;

    const tickets = await Ticket.findAll({
      where: { user_id: user_id, Status: "Pending" },
      // where: { user_id: 2, Status: "Pending" },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        }, // Include claim user information
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        }, // Include transferred claim user information
        { model: Department, as: "AssignedToDepartment" }, // Include assigned department information
        { model: SubDepartment, as: "AssignedToSubDepartment" }, // Include assigned sub department information
        { model: Department, as: "TransferredToDepartment" }, // Include transferred department information
        { model: SubDepartment, as: "TransferredToSubDepartment" }, // Include transferred sub department information
        { model: TicketUpdate }, // Include ticket updates
        // { model: TicketResolution }, // Include ticket resolution
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        // Add other associations as needed
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/Resolved/tickets/:user_id", async (req, res) => {
  try {
    // Fetch all tickets from the database and include associated models' data
    const user_id = req.params.user_id;

    const tickets = await Ticket.findAll({
      where: { user_id: user_id, Status: "Resolved" },
      // where: { user_id: 2, Status: "Pending" },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        }, // Include claim user information
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        }, // Include transferred claim user information
        { model: Department, as: "AssignedToDepartment" }, // Include assigned department information
        { model: SubDepartment, as: "AssignedToSubDepartment" }, // Include assigned sub department information
        { model: Department, as: "TransferredToDepartment" }, // Include transferred department information
        { model: SubDepartment, as: "TransferredToSubDepartment" }, // Include transferred sub department information
        { model: TicketUpdate }, // Include ticket updates
        // { model: TicketResolution }, // Include ticket resolution
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        // Add other associations as needed
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/Closed/tickets/:user_id", async (req, res) => {
  try {
    // Fetch all tickets from the database and include associated models' data
    const user_id = req.params.user_id;

    const tickets = await Ticket.findAll({
      where: { user_id: user_id, Status: "Closed" },
      // where: { user_id: 2, Status: "Pending" },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        }, // Include claim user information
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        }, // Include transferred claim user information
        { model: Department, as: "AssignedToDepartment" }, // Include assigned department information
        { model: SubDepartment, as: "AssignedToSubDepartment" }, // Include assigned sub department information
        { model: Department, as: "TransferredToDepartment" }, // Include transferred department information
        { model: SubDepartment, as: "TransferredToSubDepartment" }, // Include transferred sub department information
        { model: TicketUpdate }, // Include ticket updates
        // { model: TicketResolution }, // Include ticket resolution
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        // Add other associations as needed
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/emp-ticket/closed/:user_id", async (req, res) => {
  try {
    // Extract user_id from request parameters
    const user_id = req.params.user_id;

    // Fetch tickets from the database
    const tickets = await Ticket.findAll({
      where: {
        // claim_User_Id: user_id,
        Status: "Closed",
        [Op.or]: [
          { claim_User_Id: user_id },
          { transferred_Claim_User_id: user_id },
          // { transferred_Claim_User_id: null },
        ],
      },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/emp-ticket/resolved/:user_id", async (req, res) => {
  try {
    // Extract user_id from request parameters
    const user_id = req.params.user_id;

    // Fetch tickets from the database
    const tickets = await Ticket.findAll({
      where: {
        Status: "Resolved",
        [Op.or]: [
          { claim_User_Id: user_id },
          { transferred_Claim_User_id: user_id },
          // { transferred_Claim_User_id: null },
        ],
      },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//Tickets less than 24h

router.get("/emp-ticket/less/claimed/:user_id", async (req, res) => {
  try {
    // Extract user_id from request parameters
    const user_id = req.params.user_id;

    // Fetch tickets from the database
    const tickets = await Ticket.findAll({
      where: {
        Status: "Pending",
        TransferredToDepartmentID: {
          [Op.is]: null,
        },
        claim_User_Id: user_id,
        createdAt: {
          [Op.gte]: moment().subtract(24, "hours").toDate(),
        },
        // transferred_Claim_User_id:user_id,
      },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Tickets in between 24h to 48 h

router.get("/emp-ticket/between/claimed/:user_id", async (req, res) => {
  try {
    // Extract user_id from request parameters
    const user_id = req.params.user_id;

    // Fetch tickets from the database
    const tickets = await Ticket.findAll({
      where: {
        Status: "Pending",
        TransferredToDepartmentID: {
          [Op.is]: null,
        },
        claim_User_Id: user_id,
        createdAt: {
          [Op.between]: [
            moment().subtract(48, "hours").toDate(),
            moment().subtract(24, "hours").toDate(),
          ],
        },
        // transferred_Claim_User_id:user_id,
      },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Tickets above 48h

router.get("/emp-ticket/above/claimed/:user_id", async (req, res) => {
  try {
    // Extract user_id from request parameters
    const user_id = req.params.user_id;

    // Fetch tickets from the database
    const tickets = await Ticket.findAll({
      where: {
        Status: "Pending",
        TransferredToDepartmentID: {
          [Op.is]: null,
        },
        claim_User_Id: user_id,
        createdAt: {
          [Op.lt]: moment().subtract(48, "hours").toDate(),
        },
        // transferred_Claim_User_id:user_id,
      },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/emp-ticket/claimed-trf/:user_id", async (req, res) => {
  try {
    // Extract user_id from request parameters
    const user_id = req.params.user_id;

    // Fetch tickets from the database
    const tickets = await Ticket.findAll({
      where: {
        Status: "Pending",
        transferred_Claim_User_id: user_id,
      },
      include: [
        {
          model: User,
          as: "claim_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        {
          model: User,
          as: "transferredClaimUser",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
        { model: Department, as: "AssignedToDepartment" },
        { model: SubDepartment, as: "AssignedToSubDepartment" },
        { model: Department, as: "TransferredToDepartment" },
        { model: SubDepartment, as: "TransferredToSubDepartment" },
        { model: TicketUpdate },
        {
          model: User,
          as: "from_User",
          include: [
            {
              model: Department,
              include: [{ model: SubDepartment }],
            },
          ],
        },
      ],
    });

    // Send success response with the retrieved tickets
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    // Send error response if an error occurs
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = {
  router,
  createTicket,
  updateTicket,
  claimTicket,
  transfclaimTicket,
};
