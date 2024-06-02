const express = require("express");
const Training = require("../models/Training");
const User = require("../models/User");
const TrainingFeedback = require("../models/TrainingFeedback");
const sendEmail = require("../sendEmail");

const router = express.Router();

router.post("/trainings", async (req, res) => {
  try {
    console.log(req.body, 10);
    const training = await Training.create(req.body);
    const trainingData = training.dataValues;
    sendEmailToAllAttendes(trainingData);
    res.status(201).json(training);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function sendEmailToAllAttendes(data) {
  const emailBodyUser = `
    <div style="font-family: Arial, sans-serif; color: #333;">
    <p>Dear Trainee </p>
    <p>Greetings for the day...!</p>
    <p>This email is to inform you that your Training Feedback On Date ${data.TrainingDate} .</p>
    <h4>For FeedBack Cink on <a href="http://localhost:5173/admin/training/FeedBack/${data.TrainingId}">Link</a></h4>
    <h3 style="color: #004080;">Training Details:</h3>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Field</th>
        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2;">Details</th>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Trainer</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${data.Trainer}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Training Title</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${data.Title}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Training Description</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${data.Description}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Recording Link</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${data.TrainingLink}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Date</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${data.TrainingDate}</td>
      </tr>
    </table>
    <p>We sincerely thank you for your patience!</p>
    <p>Please do not reply to this email, as this is a system-generated email.</p>
    <p>Regards,</p>
    <p>Team MIT-School of Distance Education</p>
    <img src="https://res.cloudinary.com/dtgpxvmpl/image/upload/v1702100329/mitsde_logo_vmzo63.png" alt="MIT-School of Distance Education Logo" style="width: 150px; height: auto; margin-top: 20px;">
  </div>
    `;
  data.Attendees.forEach((email) => {
    sendEmail(
      email,
      `Training feedback: Trainer ${data.Trainer} for Training on ${data.Title}`,
      emailBodyUser
    );
  });
}

// Submit feedback for a training session
router.post("/feedback", async (req, res) => {
  try {
    console.log(req.body, 73);
    const { EmployeeEmail, TrainingId } = req.body; // Ensure EmployeeEmail and TrainingId are passed in the request body

    // Check if feedback already exists for the given employee email and training ID
    const existingFeedback = await TrainingFeedback.findOne({
      where: { EmployeeEmail: EmployeeEmail, TrainingId: TrainingId },
    });

    if (existingFeedback) {
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    // Create new feedback
    const feedback = await TrainingFeedback.create(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all training sessions with feedback
router.get("/gettrainings/:TrainerId", async (req, res) => {
    try {
      const TrainerId = req.params.TrainerId;
      const trainings = await Training.findAll({
        where: { TrainerId },
        include: TrainingFeedback,
      });
      res.status(200).json(trainings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get("/allEmployess", async (req, res) => {
  try {
    const Employees = await User.findAll({
      where: { user_Roal: "Employee" },
      attributes: ["user_Email"],
    });
    res.status(200).json({ success: true, Employees });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
