/*
    Employee Controllers:
    2. loginEmployee: Authenticates an employee and provides access tokens.
    3. getEmployeeProfile: Retrieves the profile information of the authenticated employee.
    4. updateEmployeeProfile: Updates the profile information of the authenticated employee.
    5. deleteEmployeeProfile: Deletes the profile of the authenticated employee.
    6. getAllEmployees: Retrieves a list of all employees in the system.
    7. getEmployeeById: Retrieves the profile information of a specific employee by their ID.
    8. updateEmployeeById: Updates the profile information of a specific employee by their ID.
    9. deleteEmployeeById: Deletes the profile of a specific employee by their ID.
    10. createEmployee: Creates a new employee in the system (admin only).
    11. assignRoleToEmployee: Assigns a role to a specific employee (admin only).
    12. removeRoleFromEmployee: Removes a role from a specific employee (admin only).
   # 13. createSuperAdmin: Creates a super admin user in the system (admin only).
*/

import { asyncHandler } from "../utils/asyncHandler.js";
import { type Request, type Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadImage } from "../utils/cloudinary.js";
import { Employee } from "../models/employee.model.js";

const buildOrganizationChart = (employees: any[]) => {
  const employeeMap: { [key: string]: any } = {};
  const organizationChart: any[] = [];

  employees.forEach((employee) => {
    employeeMap[employee.employeeId] = employee;
  });

  employees.forEach((employee) => {
    const reportingManagerId = employee.reportingManager;
    if (reportingManagerId && employeeMap[reportingManagerId]) {
      employeeMap[reportingManagerId].subordinates = employeeMap[reportingManagerId].subordinates || [];
      employeeMap[reportingManagerId].subordinates.push(employee);
    } else {
      organizationChart.push(employee);
    }
  });

  return organizationChart;
};

const createSuperAdmin = asyncHandler(async (req: Request, res: Response) => {
  const {
    employeeId,
    employeeName,
    employeeEmail,
    role,
    password,
    phoneNumber,
    designation,
    department,
    salary,
    joiningDate
  } = req.body;
  if (
    !employeeId ||
    !employeeName ||
    !employeeEmail ||
    !password ||
    !phoneNumber ||
    !designation ||
    !department ||
    !salary ||
    !joiningDate || !role
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (role !== "super_admin") {
    throw new ApiError(400, "Only super admins can be created");
  }
  if (
    [
      employeeId,
      employeeName,
      employeeEmail,
      password,
      phoneNumber,
      designation,
      department,
      salary,
      joiningDate,
        role
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields must be filled");
  }

  const existingEmployee = await Employee.findOne({
    $or: [{ employeeId }, { employeeEmail }, { phoneNumber }],
  });

  if (existingEmployee) {
    throw new ApiError(
      400,
      "Employee with the same ID, email, or phone number already exists"
    );
  }

  const avatarLocalPath = req.file?.path;

  const avatarUrl = avatarLocalPath
    ? await uploadImage(avatarLocalPath as string)
    : "";

  const newEmployee = await Employee.create({
    employeeId,
    employeeName,
    employeeEmail,
    role,
    password,
    phoneNumber,
    designation,
    department,
    salary,
    joiningDate,
    profilePicture: avatarUrl,
  });

  if (!newEmployee) {
    throw new ApiError(500, "Failed to create super admin");
  }
  return res.status(201).json(
    new ApiResponse(201, "Super admin created successfully", {
      employeeId: newEmployee.employeeId,
      employeeName: newEmployee.employeeName,
      employeeEmail: newEmployee.employeeEmail,
      role: newEmployee.role,
      phoneNumber: newEmployee.phoneNumber,
      designation: newEmployee.designation,
      department: newEmployee.department,
      salary: newEmployee.salary,
      joiningDate: newEmployee.joiningDate,
      reportingManager: newEmployee.reportingManager,
      profilePicture: newEmployee.profilePicture,
    })
  );
});

const loginEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId, employeeEmail, password } = req.body;
  if (!employeeId && !employeeEmail) {
    throw new ApiError(400, "Employee ID or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  const existingEmployee = await Employee.findOne({
    $or: [{ employeeId }, { employeeEmail }],
  });

  if (!existingEmployee) {
    throw new ApiError(401, "Invalid employee ID or email");
  }

  const isPasswordValid = await existingEmployee.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const accessToken = existingEmployee.generateAccessToken();
  const refreshToken = existingEmployee.generateRefreshToken();

  existingEmployee.refreshToken = refreshToken;

  await existingEmployee.save();

  const loggedinEmployee = await Employee.findById(existingEmployee._id).select(
    "-password"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "Employee logged in successfully", {
        accessToken,
        refreshToken,
        employee: loggedinEmployee,
      })
    );
});

const createEmployee = asyncHandler(async (req: Request, res: Response) => {
    if (req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
        throw new ApiError(403, "Only super admins and HR can create employees");
    }
    
    const { employeeId, employeeName, employeeEmail, role, password, phoneNumber, designation, department, salary, joiningDate, reportingManager } = req.body;
    if (!employeeId || !employeeName || !employeeEmail ||!role || !password || !phoneNumber || !designation || !department || !salary || !joiningDate || !reportingManager) {
        throw new ApiError(400, "All fields are required");
    }

    const existingEmployee = await Employee.findOne({ $or: [{ employeeId }, { employeeEmail }, { phoneNumber }] });
    if (existingEmployee) {
        throw new ApiError(400, "Employee with the same ID, email, or phone number already exists");
    }

    const newEmployee = await Employee.create({
        employeeId,
        employeeName,
        employeeEmail,
        role,
        password,
        phoneNumber,
        designation,
        department,
        salary,
        joiningDate,
        reportingManager,
    });

    if (!newEmployee) {
        throw new ApiError(500, "Failed to create employee");
    }

    return res.status(201).json(
        new ApiResponse(201, "Employee created successfully", {
            employeeId: newEmployee.employeeId,
            employeeName: newEmployee.employeeName,
            employeeEmail: newEmployee.employeeEmail,
            role: newEmployee.role,
            phoneNumber: newEmployee.phoneNumber,
            designation: newEmployee.designation,
            department: newEmployee.department,
            salary: newEmployee.salary,
            joiningDate: newEmployee.joiningDate,
            reportingManager: newEmployee.reportingManager,
        })
    );

});

const selfUpdateByEmployee = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employee?.employeeId;
    if (!employeeId) {
        throw new ApiError(401, "Unauthorized");
    }
    
    const { password, phoneNumber } = req.body;

    if (password && password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const avatarLocalPath = req.file?.path;

    const avatarUrl = avatarLocalPath
        ? await uploadImage(avatarLocalPath as string)
        : "";

    const updatedEmployee = await Employee.findByIdAndUpdate(
        req.employee._id,
        { $set: { phoneNumber: phoneNumber, profilePicture: avatarUrl, password: password } },
        { new: true }
    ).select("-password");

    if (!updatedEmployee) {
        throw new ApiError(500, "Failed to update employee");
    }

    return res.status(200).json(
        new ApiResponse(200, "Employee updated successfully", updatedEmployee)
    );
});

const updateBySuperAdminorHR = asyncHandler(async (req: Request, res: Response) => {
    if (req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
        throw new ApiError(403, "Only super admins and HR can update employees");
    }

    const { employeeId } = req.params;
    const { phoneNumber, role, department, designation, salary } = req.body;

    if (req.employee?.role === "hr" && role === "super_admin") {
        throw new ApiError(403, "HR cannot assign super admin role");
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
        employeeId,
        { $set: { phoneNumber: phoneNumber, role: role, department: department, designation: designation, salary: salary } },
        { new: true }
    ).select("-password");

    if (!updatedEmployee) {
        throw new ApiError(500, "Failed to update employee");
    }

    return res.status(200).json(
        new ApiResponse(200, "Employee updated successfully", updatedEmployee)
    );
});

const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    if (req.employee?.role !== "super_admin") {
        throw new ApiError(403, "Only super admins can delete employees");
    }
    
    const { employeeId } = req.body;

    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);

    if (!deletedEmployee) {
        throw new ApiError(404, "Employee not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Employee deleted successfully", deletedEmployee)
    );
});

const getEmployeeProfilebyId = asyncHandler(async (req: Request, res: Response) => {
  if(req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
    throw new ApiError(403, "Only super admins and HR can view any employee profiles");
  }

  const { employeeId } = req.body;
  const employee = await Employee.findById(employeeId).select("-password");

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, "Employee profile retrieved successfully", employee)
  );

});

const getAllEmployees = asyncHandler(async (req: Request, res: Response) => {
    if(req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
        throw new ApiError(403, "Only super admins and HR can view all employee profiles");
    }

    const employees = await Employee.find().select("-password");

    return res.status(200).json(
        new ApiResponse(200, "All employees retrieved successfully", employees)
    );
});

const getEmployeeProfile = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employee?.employeeId;
    if (!employeeId) {
        throw new ApiError(401, "Unauthorized");
    }

    const employee = await Employee.findById(employeeId).select("-password");

    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Employee profile retrieved successfully", employee)
    );
});

const getEmployeeByDepartment = asyncHandler(async (req: Request, res: Response) => {
    if(req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
        throw new ApiError(403, "Only super admins and HR can view employees by department");
    }
    const { department } = req.body;
    const employees = await Employee.find().where("department").equals(department).select("-password");

    return res.status(200).json(
        new ApiResponse(200, "Employees retrieved successfully", employees)
    );
});

const getEmployeeByRole = asyncHandler(async (req: Request, res: Response) => {
    if(req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
        throw new ApiError(403, "Only super admins and HR can view employees by role");
    }
    const { role } = req.body;
    const employees = await Employee.find().where("role").equals(role).select("-password");

    return res.status(200).json(
        new ApiResponse(200, "Employees retrieved successfully", employees)
    );
});

const getEmployeeByDesignation = asyncHandler(async (req: Request, res: Response) => {
    if(req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
        throw new ApiError(403, "Only super admins and HR can view employees by designation");
    }
    const { designation } = req.body;
    const employees = await Employee.find().where("designation").equals(designation).select("-password");

    return res.status(200).json(
        new ApiResponse(200, "Employees retrieved successfully", employees)
    );
});

const getEmployeeByStatus = asyncHandler(async (req: Request, res: Response) => {
    if(req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
        throw new ApiError(403, "Only super admins and HR can view employees by status");
    }
    const { status } = req.body;
    const employees = await Employee.find().where("status").equals(status).select("-password");
    
    return res.status(200).json(
        new ApiResponse(200, "Employees retrieved successfully", employees)
    );
});

const logoutEmployee = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.employee?.employeeId;
    if (!employeeId) {
        throw new ApiError(401, "Unauthorized");
    }

    await Employee.findByIdAndUpdate(
        req.employee._id,
        {
            $set: { refreshToken: undefined }
        },
        { returnDocument: "after" }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("refreshToken", cookieOptions)
        .clearCookie("accessToken", cookieOptions)
        .json(
            new ApiResponse(200, "Employee logged out successfully", null)
        );

  });
    

// show organization tree

const getOrganizationChart = asyncHandler(async (req: Request, res: Response) => {
    if(req.employee?.role !== "super_admin" && req.employee?.role !== "hr") {
        throw new ApiError(403, "Only super admins and HR can view the organization chart");
    }

    const employees = await Employee.find().select("-password");

    const organizationChart = buildOrganizationChart(employees);

    return res.status(200).json(
        new ApiResponse(200, "Organization chart retrieved successfully", organizationChart)
    );
});




export { createSuperAdmin, loginEmployee, createEmployee, selfUpdateByEmployee, updateBySuperAdminorHR, deleteEmployee, getEmployeeProfilebyId, getEmployeeProfile, getEmployeeByDepartment, getEmployeeByRole, getAllEmployees, getEmployeeByDesignation, getEmployeeByStatus, logoutEmployee, getOrganizationChart };
