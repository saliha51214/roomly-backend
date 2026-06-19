const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Match = require("../models/Match");

const extractTokenFromCookieHeader = (cookieHeader) => {
  if (!cookieHeader) return null;
  const match = cookieHeader.split("; ").find((c) => c.startsWith("accessToken="));
  return match ? match.split("=")[1] : null;
};

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token || extractTokenFromCookieHeader(socket.handshake.headers?.cookie);

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", async (matchId) => {
      const match = await Match.findById(matchId);
      const isParticipant =
        match &&
        match.status === "matched" &&
        (match.userA.toString() === socket.userId || match.userB.toString() === socket.userId);

      if (isParticipant) {
        socket.join(matchId);
      }
    });

    socket.on("sendMessage", async ({ matchId, text }) => {
      try {
        if (!text || text.trim().length === 0 || text.length > 1000) return;

        const match = await Match.findById(matchId);
        const isParticipant =
          match &&
          match.status === "matched" &&
          (match.userA.toString() === socket.userId || match.userB.toString() === socket.userId);

        if (!isParticipant) return;

        const message = await Message.create({
          matchId,
          sender: socket.userId,
          text: text.trim(),
        });

        io.to(matchId).emit("receiveMessage", message);
      } catch (error) {
        socket.emit("errorMessage", "Could not send message");
      }
    });
  });
};

module.exports = socketHandler;
