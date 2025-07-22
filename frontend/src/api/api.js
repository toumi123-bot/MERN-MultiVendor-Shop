import axios from "axios";

const local = "http://localhost:5000";
const production =
  "https://bimastore-backend-hredgxfkhxfgf9dt.francecentral-01.azurewebsites.net";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? `${production}/api`
      : `${local}/api`,
});

export default api;
