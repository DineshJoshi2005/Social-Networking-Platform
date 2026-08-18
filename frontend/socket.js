import { io } from "socket.io-client";

const serverUrl = import.meta.env.VITE_SERVER_URL || "https://social-networking-platform-7wnj.onrender.com";

export const socket = io(serverUrl, {
    withCredentials: true
});