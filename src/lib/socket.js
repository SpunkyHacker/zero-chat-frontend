import { io } from "socket.io-client";

// Replace this with your actual backend Render URL
const BACKEND_URL = "https://zero-chat.onrender.com";

// Create the Socket.IO client instance
export const socket = io(BACKEND_URL, {
  transports: ["websocket"],
});
