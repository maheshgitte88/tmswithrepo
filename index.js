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
