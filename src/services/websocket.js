"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class WebSocketService {
    constructor(server) {
        this.clients = new Map();
        this.wss = new ws_1.default.Server({ server });
        this.wss.on("connection", (ws) => {
            console.log("New client connected");
            // Generate unique ID for client
            const clientId = Math.random().toString(36).substring(7);
            this.clients.set(clientId, ws);
            // Send welcome message
            ws.send(JSON.stringify({
                type: "connection",
                message: "Connected to gaming server",
                clientId,
            }));
            // Handle messages from client
            ws.on("message", (message) => {
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
    handleMessage(clientId, message) {
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
        }
        catch (error) {
            console.error("Message handling error:", error);
        }
    }
    // Subscribe to game updates
    handleSubscribe(clientId, data) {
        const client = this.clients.get(clientId);
        if (client) {
            client.send(JSON.stringify({
                type: "subscribed",
                game: data.game,
                message: `Subscribed to ${data.game} updates`,
            }));
        }
    }
    // Unsubscribe from game updates
    handleUnsubscribe(clientId, data) {
        const client = this.clients.get(clientId);
        if (client) {
            client.send(JSON.stringify({
                type: "unsubscribed",
                game: data.game,
                message: `Unsubscribed from ${data.game} updates`,
            }));
        }
    }
    // Broadcast message to all clients
    broadcast(message) {
        this.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}
exports.default = WebSocketService;
