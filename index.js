const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require('fs');
// const https = require('https');
const http = require('http');

const cloudinary = require("./cloudinaryConfig");
require('dotenv').config();
const sequelize = require("./config");
const multer = require("multer");
const Auth = require('./routes/auth');
const Ticket = require('./routes/ticket');
const Hierarchy = require('./routes/hierarchy');
const Training = require('./routes/training');
const ProActive = require('./routes/proActive')
const Reports =require('./routes/reports')
const upload = multer({ dest: "uploads/" });

const port = process.env.PORT || 2000;
const app = express();

// Read the certificate and private key
// const options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };

// Create the HTTPS server
// const server = https.createServer(options, app);
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    // origin: "https://master.d7ghmfcjtu6yi.amplifyapp.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.any());

io.on('connection', (socket) => {
  console.log(`Client Connected: ${socket.id}`);

  socket.on("joinDepaTicketRoom", (DepartmentId) => {
    socket.join(DepartmentId);
    console.log(`User ${socket.id} joined room ${DepartmentId}`);
  });

  socket.on('createTicket', async (data) => {
    try {
      const createdTicket = await Ticket.createTicket(data);
      const roomid = data.AssignedToSubDepartmentID;
      console.log(roomid, 61);
      io.to(roomid).emit("updatedDeptTicketChat", createdTicket);
      socket.emit("ticketCreated", createdTicket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      socket.emit("ticketCreationError", { message: "Internal server error" });
    }
  });

  socket.on("updatedticketRoom", (SubDepartmentId) => {
    socket.join(SubDepartmentId);
    console.log(`User ${socket.id} joined room For TicketUpdate with Id ${SubDepartmentId}`);
  });

  socket.on("internaltTrnRepTicketUpdate", (transferDep) => {
    socket.join(transferDep);
    console.log(`User ${socket.id} joined room For TicketUpdate with Id ${transferDep}`);
  });

  socket.on("userUpdatedticketRoom", (TicketID) => {
    socket.join(TicketID);
    console.log(`User ${socket.id} joined room ${TicketID}`);
  });
  socket.on('updateTicket', async (data) => {
    try {
      const updateTicket = await Ticket.updateTicket(data);
      const roomid = data.AssignedToSubDepartmentID;
      console.log(roomid, 82);
      console.log(updateTicket.TicketID, 83 );

      io.to(roomid).emit("updatedticketData", updateTicket);
      io.to(updateTicket.TicketID).emit("userUpdatedticketReciverd", updateTicket);
      socket.emit("ticketUpdatedReciverd", updateTicket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      socket.emit("ticketCreationError", { message: "Internal server error" });
    }
  });

  socket.on('claimTicket', async (data) => {
    try {
      const claimedTicket = await Ticket.claimTicket(data);
      const roomid = data.AssignedToSubDepartmentID;
      console.log(roomid, claimedTicket, 61);
      io.to(roomid).emit("ticketClaimed", claimedTicket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      socket.emit("ticketCreationError", { message: "Internal server error" });
    }
  });

  socket.on('transfclaimTicket', async (data) => {
    try {
      const claimedTicket = await Ticket.transfclaimTicket(data);
      const roomid = data.AssignedToSubDepartmentID;
      console.log(roomid, 61);
      io.to(roomid).emit("tranfticketClaimed", claimedTicket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      socket.emit("ticketCreationError", { message: "Internal server error" });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use('/api', Auth);
app.use('/api', Ticket.router);
app.use('/api', Hierarchy);
app.use('/api', Training);
app.use('/api', ProActive);
app.use('/api', Reports);



app.post("/api/img-save", async (req, res) => {
  console.log(req.body, 230);
  try {
    let updatedAttachmentUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ticket-updates",
        });
        console.log(result, 246);
        updatedAttachmentUrls.push(result.secure_url);
      }
    }
    console.log(updatedAttachmentUrls, 283);
    res.json({
      success: true,
      message: "TicketUpdate created successfully",
      data: updatedAttachmentUrls,
    });
  } catch (error) {
    console.error("Error saving image:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const isWithinWorkingHours = (date) => {
  const startHour = 10;
  const startMinute = 0;
  const endHour = 16;
  const endMinute = 0;

  const hour = date.getUTCHours(); // Use getUTCHours to get hours in UTC
  const minute = date.getUTCMinutes(); // Use getUTCMinutes to get minutes in UTC

  if (hour < startHour || hour > endHour) return false;
  if (hour === startHour && minute < startMinute) return false;
  if (hour === endHour && minute > endMinute) return false;

  return true;
};
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};
const getWorkingMinutes = (start, end) => {
  let totalMinutes = 0;
  let current = new Date(start);

  while (current <= end) {
      if (!isWeekend(current) && isWithinWorkingHours(current)) {
          totalMinutes++;
      }
      current.setUTCMinutes(current.getUTCMinutes() + 1); // Use setUTCMinutes to adjust minutes in UTC
  }

  return totalMinutes;
};
const getOrignalMinutes = (start, end) => {
  let totalMinutesOrg = 0;
  let current = new Date(start);

  while (current <= end) {
      // if (!isWeekend(current) && isWithinWorkingHours(current)) {
      totalMinutesOrg++;
      // }
      current.setUTCMinutes(current.getUTCMinutes() + 1); // Use setUTCMinutes to adjust minutes in UTC
  }

  return totalMinutesOrg;
};
const calculateTAT = (createdAt, resolutionTimestamp, ticketResTimeInMinutes, TransferredToDepartmentID, transferred_Timestamp) => {
  const start = new Date(createdAt);
  const resolution = new Date(resolutionTimestamp);

  let actualTAT = 0;
  let tranfActualTAT = 0;
  let OrigtranfActualTAT = 0;
  let actualTATOrig = 0;

  if(TransferredToDepartmentID) {
      const transferred = new Date(transferred_Timestamp);
      tranfActualTAT = getWorkingMinutes(start, resolution);
      actualTAT = getWorkingMinutes(resolution, transferred);
      OrigtranfActualTAT = getOrignalMinutes(start, resolution)
      actualTATOrig = getOrignalMinutes(resolution, transferred)

  } else {
      actualTAT = getWorkingMinutes(start, resolution);
      actualTATOrig = getOrignalMinutes(start, resolution)
      tranfActualTAT = 0;
  }

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
      actualTATOrig,
      benchmarkPercentage,
      benchmarkCategory,
      tranfActualTAT,
      OrigtranfActualTAT 
  };
};

// Example usage:
const result = calculateTAT(
  "2024-06-15 16:01:55",
  "2024-06-15 16:14:37",
  200, // Ticket resolution time in minutes
  1, // TransferredToDepartmentID (assuming this is an ID)
  "2024-06-15 16:16:42"
);

console.log(result);




sequelize
  .sync({ force: false })
  .then(() => {
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing Sequelize models:", error);
  });
