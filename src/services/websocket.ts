// src/services/websocket.ts
import WebSocket from "ws";
import { Server } from "http";

class WebSocketService {
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New client connected");

      // Generate unique ID for client
      const clientId = Math.random().toString(36).substring(7);
      this.clients.set(clientId, ws);

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connection",
          message: "Connected to gaming server",
          clientId,
        })
      );

      // Handle messages from client
      ws.on("message", (message: string) => {
        this.handleMessage(clientId, message);
      });

      // Handle client disconnect
      ws.on("close", () => {
        console.log("Client disconnected");
        this.clients.delete(clientId);
      });
    });
  }

  // Handle incoming messages
  private handleMessage(clientId: string, message: string) {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "subscribe":
          this.handleSubscribe(clientId, data);
          break;
        case "unsubscribe":
          this.handleUnsubscribe(clientId, data);
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Message handling error:", error);
    }
  }

  // Subscribe to game updates
  private handleSubscribe(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client) {
      client.send(
        JSON.stringify({
          type: "subscribed",
          game: data.game,
          message: `Subscribed to ${data.game} updates`,
        })
      );
    }
  }

  // Unsubscribe from game updates
  private handleUnsubscribe(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client) {
      client.send(
        JSON.stringify({
          type: "unsubscribed",
          game: data.game,
          message: `Unsubscribed from ${data.game} updates`,
        })
      );
    }
  }

  // Broadcast message to all clients
  broadcast(message: any) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export default WebSocketService;
