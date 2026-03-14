import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./env";

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.nodeEnv === "production" ? env.clientOrigin : true,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", (room) => {
      if (room) {
        socket.join(room);
      }
    });

    socket.on("leave", (room) => {
      if (room) {
        socket.leave(room);
      }
    });

    socket.on("disconnect", () => {
      // Client disconnected
    });
  });

  return io;
};

export const getIo = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

