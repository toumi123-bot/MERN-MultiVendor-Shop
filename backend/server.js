require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const socket = require("socket.io");

const { dbConnect } = require("./utiles/db");

// Création du serveur HTTP
const server = http.createServer(app);

// Middlewares globaux
app.use(
  cors({
    origin: ["bimastore-ekhehwbbenf5cqcr.francecentral-01.azurewebsites.net"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

// Routes API (à mettre AVANT la gestion des fichiers statiques et du catch-all)
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

// Fichiers statiques (frontend compilé dans /public)
app.use(express.static(path.join(__dirname, "public")));

// Route test principale
app.get("/", (req, res) => res.send("Hello Server"));

// Catch-all pour React Router ou autre routing côté client
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.io
const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
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
  console.log("socket server running..");

  soc.on("add_user", (customerId, userInfo) => {
    addUser(customerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });

  soc.on("add_seller", (sellerId, userInfo) => {
    addSeller(sellerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });

  soc.on("send_seller_message", (msg) => {
    const customer = findCustomer(msg.receiverId); // corrigé "receverId" -> "receiverId"
    if (customer) {
      soc.to(customer.socketId).emit("seller_message", msg);
    }
  });

  soc.on("send_customer_message", (msg) => {
    const seller = findSeller(msg.receiverId); // idem correction
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

  soc.on("disconnect", () => {
    console.log("user disconnect");
    remove(soc.id);
    io.emit("activeSeller", allSeller);
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
});

// Connexion à la base de données
dbConnect();

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
