require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const socket = require("socket.io");

const { dbConnect } = require("./utiles/db");

// Création du serveur HTTP
const server = http.createServer(app);

// Middleware global
app.use(
  cors({
    origin: [
      "https://bimastore-ekhehwbbenf5cqcr.francecentral-01.azurewebsites.net",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// --- ROUTES API ---
app.use("/api/home", require("./routes/home/homeRoutes"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/order/orderRoutes"));
app.use("/api", require("./routes/home/cardRoutes"));
app.use("/api", require("./routes/dashboard/categoryRoutes"));
app.use("/api", require("./routes/dashboard/productRoutes"));
app.use("/api", require("./routes/dashboard/sellerRoutes"));
app.use("/api", require("./routes/home/customerAuthRoutes"));
app.use("/api", require("./routes/chatRoutes"));
app.use("/api", require("./routes/paymentRoutes"));
app.use("/api", require("./routes/dashboard/dashboardRoutes"));

// --- TEST SIMPLE ---
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend API is working correctly on Azure." });
});

// --- Catch-all pour bloquer les accès non-API ---
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ error: "❌ API route not found" });
  }
  res.send("✅ BimaStore API - Backend seulement (pas de frontend ici)");
});

// --- SOCKET.IO ---
const io = socket(server, {
  cors: {
    origin: [
      "https://bimastore-ekhehwbbenf5cqcr.francecentral-01.azurewebsites.net",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

let allCustomer = [];
let allSeller = [];
let admin = {};

const addUser = (customerId, socketId, userInfo) => {
  if (!allCustomer.some((u) => u.customerId === customerId)) {
    allCustomer.push({ customerId, socketId, userInfo });
  }
};

const addSeller = (sellerId, socketId, userInfo) => {
  if (!allSeller.some((u) => u.sellerId === sellerId)) {
    allSeller.push({ sellerId, socketId, userInfo });
  }
};

const findCustomer = (customerId) =>
  allCustomer.find((c) => c.customerId === customerId);
const findSeller = (sellerId) => allSeller.find((c) => c.sellerId === sellerId);

const remove = (socketId) => {
  allCustomer = allCustomer.filter((c) => c.socketId !== socketId);
  allSeller = allSeller.filter((c) => c.socketId !== socketId);
};

io.on("connection", (soc) => {
  console.log("🔌 New socket connection");

  soc.on("add_user", (customerId, userInfo) => {
    addUser(customerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });

  soc.on("add_seller", (sellerId, userInfo) => {
    addSeller(sellerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });

  soc.on("send_seller_message", (msg) => {
    const customer = findCustomer(msg.receiverId);
    if (customer) {
      soc.to(customer.socketId).emit("seller_message", msg);
    }
  });

  soc.on("send_customer_message", (msg) => {
    const seller = findSeller(msg.receiverId);
    if (seller) {
      soc.to(seller.socketId).emit("customer_message", msg);
    }
  });

  soc.on("send_message_admin_to_seller", (msg) => {
    const seller = findSeller(msg.receiverId);
    if (seller) {
      soc.to(seller.socketId).emit("receved_admin_message", msg);
    }
  });

  soc.on("send_message_seller_to_admin", (msg) => {
    if (admin.socketId) {
      soc.to(admin.socketId).emit("receved_seller_message", msg);
    }
  });

  soc.on("add_admin", (adminInfo) => {
    delete adminInfo.email;
    delete adminInfo.password;
    admin = { ...adminInfo, socketId: soc.id };
    io.emit("activeSeller", allSeller);
  });

  soc.on("disconnect", () => {
    console.log("🚫 Socket disconnected");
    remove(soc.id);
    io.emit("activeSeller", allSeller);
  });
});

// --- DB + Start server ---
dbConnect();
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`✅ Server is running on port ${port}`));
