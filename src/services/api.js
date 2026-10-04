import axios from "axios";

const API = axios.create({
  baseURL: "https://cravings-backend-3znd.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getFoods = () => API.get("/foods");

export const getFoodById = (id) =>
  API.get(`/foods/${id}`);

export const registerUser = (userData) =>
  API.post("/auth/register", userData);

export const loginUser = (loginData) =>
  API.post("/auth/login", loginData);

export const createOrder = (orderData, token) =>
  API.post("/orders", orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getMyOrders = (token) =>
  API.get("/orders/my-orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getOrderById = (id, token) =>
  API.get(`/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const cancelOrder = (id, token) =>
  API.put(
    `/orders/${id}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export default API;