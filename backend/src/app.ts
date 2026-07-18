import express, { type Express } from "express";
import cors, { type CorsRequest } from "cors";
import cookieParser from "cookie-parser";

const app: Express = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import employeeRoutes from "./routes/employee.routes.js";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/organization", organizationRoutes);

export default app;