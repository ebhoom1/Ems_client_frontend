import { io } from "socket.io-client";

let socket;

export const getSocket = (url) => {
  if (!socket) {
    socket = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};