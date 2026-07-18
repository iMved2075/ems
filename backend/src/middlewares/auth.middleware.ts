import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { type Request,type Response, type NextFunction } from "express";
import { Employee } from "../models/employee.model.js";

declare global {
    namespace Express {
        interface Request {
            employee?: any;
        }
    }
}

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");
    if (!accessToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as { _id: string };
        const employee = await Employee.findById(decodedToken?._id).select("-password -refreshToken");
        if (!employee) {
            throw new ApiError(401, "Invalid access token");
        }
        req.employee = employee;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});