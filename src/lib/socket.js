// frontend/src/lib/socket.js
import { io } from "socket.io-client";

// 👇 Replace with your PC's actual IP
const URL = "http://192.168.1.35:3001"; // ✅ NOT localhost

const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"], // ✅ ensures full WebSocket
});

export default socket;
