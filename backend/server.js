require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const socket = require("socket.io");
const { dbConnect } = require("./utiles/db");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
// --- Sécurité & perf ---
const helmet = require("helmet");
const compression = require("compression");

// --- Créer serveur HTTP ---
const server = http.createServer(app);

// --- Origines autorisées ---
const allowedOrigins = [
  "https://icy-smoke-09917aa1e.1.azurestaticapps.net",
  "https://ambitious-desert-0d4d5481e.1.azurestaticapps.net",
  "http://localhost:3000",
  "http://localhost:3001",
];

// --- Middlewares globaux ---
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

// --- SOCKET.IO ---
const io = socket(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["polling"], // ✅ Forcer polling uniquement
});

const pubClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false, // nécessaire pour Azure Redis SSL
  },
});
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Redis adapter connecté avec succès");
  })
  .catch((err) => {
    console.error("Erreur lors de la connexion Redis adapter :", err);
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
    const customer = findCustomer(msg.receverId);
    if (customer) {
      soc.to(customer.socketId).emit("seller_message", msg);
    }
  });

  soc.on("send_customer_message", (msg) => {
    const seller = findSeller(msg.receverId);
    if (seller) {
      soc.to(seller.socketId).emit("customer_message", msg);
    }
  });

  soc.on("send_message_admin_to_seller", (msg) => {
    const seller = findSeller(msg.receverId);
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
app.get("/health", (req, res) => {
  res.status(200).send("Healthy");
});
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

// --- Test route ---
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ API is working on Azure with Socket.IO" });
});

// --- Fallback pour autres routes ---
app.get("*", (req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ error: "❌ API route not found" });
  }
  res.send("✅ BimaStore Backend is running. No frontend served here.");
});

// --- Démarrer serveur après DB ---
const port = process.env.PORT || 5000;
dbConnect()
  .then(() => {
    server.listen(port, () => console.log(`✅ Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  });
