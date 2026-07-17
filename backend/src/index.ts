import app from "./app.js";
import { createServer } from "node:http";
import connectDB from "./db/index.js";
import { config } from "dotenv";

config({
    path: "./.env.local",
});


const PORT = process.env.PORT || 3000;

connectDB()
.then(() => {
    const server = createServer(app);
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Connected to MongoDB at ${process.env.MONGODB_URI}`);
    });
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1); 
});

