import "dotenv/config";
import app from "./app.js";
import { createServer } from "node:http";

const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
