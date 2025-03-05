"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const websocket_1 = __importDefault(require("./services/websocket"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const port = process.env.PORT || 3000;
// Create HTTP server using the Express app
const server = http_1.default.createServer(app_1.default);
// Initialize WebSocket service
const wsService = new websocket_1.default(server);
// Start server with WebSocket support
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
