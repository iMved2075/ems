import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log(`Attempting to connect to MongoDB at ${uri}`);
        if (!uri) {
            throw new ApiError(500, "MONGODB_URI environment variable is not set", ["MONGODB_URI is undefined"]);
        }
        const connection = await mongoose.connect(uri, {
            dbName: DB_NAME,
        });
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        throw new ApiError(500, "Failed to connect to the database", [error.message]);
    }
};

export default connectDB;