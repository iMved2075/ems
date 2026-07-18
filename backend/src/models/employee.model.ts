import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface EmployeeMethods {
    comparePassword(enteredPassword: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

interface EmployeeDoc {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    password: string;
    department: string;
    phoneNumber: string;
    designation: string;
    salary: number;
    joiningDate: Date;
    status: "active" | "inactive";
    role: "super_admin" | "hr_manager" | "employee";
    reportingManager: string;
    profilePicture: string;
    refreshToken?: string;
}

const employeeSchema = new Schema<EmployeeDoc, mongoose.Model<EmployeeDoc, {}, EmployeeMethods>, EmployeeMethods>(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        employeeName: {
            type: String,
            required: true
        },
        employeeEmail: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        department: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        },
        salary: {
            type: Number,
            required: true
        },
        joiningDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        role: {
            type: String,
            enum: ["super_admin", "hr_manager", "employee"],
            required: true
        },
        reportingManager: {
            type: String,
        },
        profilePicture: {
            type: String,
            default: ""
        },
        refreshToken: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

employeeSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 12);
});

employeeSchema.methods.comparePassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
}

employeeSchema.methods.generateAccessToken = function () {
    const secret = process.env.ACCESS_TOKEN_SECRET as jwt.Secret;
    const expiration = process.env.ACCESS_TOKEN_EXPIRATION as jwt.SignOptions["expiresIn"];
    if (!secret || !expiration) {
        throw new Error("ACCESS_TOKEN_SECRET or ACCESS_TOKEN_EXPIRATION is not defined in the environment variables.");
    }
    const accessToken = jwt.sign(
        { id: this._id, role: this.role, employeeId: this.employeeId, employeeEmail: this.employeeEmail },
        secret,
        { expiresIn: expiration}
    );
    return accessToken;
}

employeeSchema.methods.generateRefreshToken = function () {
    const secret = process.env.REFRESH_TOKEN_SECRET as jwt.Secret;
    const expiration = process.env.REFRESH_TOKEN_EXPIRATION as jwt.SignOptions["expiresIn"];
    if (!secret || !expiration) {
        throw new Error("REFRESH_TOKEN_SECRET or REFRESH_TOKEN_EXPIRATION is not defined in the environment variables.");
    }
    const refreshToken = jwt.sign(
        { id: this._id, role: this.role, employeeId: this.employeeId, employeeEmail: this.employeeEmail },
        secret,
        { expiresIn: expiration }
    );
    return refreshToken;
}

export const Employee = mongoose.model("Employee", employeeSchema);