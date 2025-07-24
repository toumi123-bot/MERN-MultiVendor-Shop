import axios from "axios";

const api = axios.create({
  baseURL:
    "http://bimastore-backend-hredgxfkhxfgf9dt.francecentral-01.azurewebsites.net/api",
});

export default api;
