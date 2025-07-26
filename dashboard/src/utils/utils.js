import io from "socket.io-client";

export const overrideStyle = {
  display: "flex",
  margin: "0 auto",
  height: "24px",
  justifyContent: "center",
  alignItems: "center",
};

export const socket = io(
  "https://bimastore-backend-hredgxfkhxfgf9dt.francecentral-01.azurewebsites.net/",
  {
    transports: ["polling"], // ✅ forcer polling
    reconnectionAttempts: 5, // 🔁 nombre de tentatives
    timeout: 10000, // ⏰ timeout de la tentative
    withCredentials: true, // ✅ si le backend utilise des cookies (session, auth)
  }
);
