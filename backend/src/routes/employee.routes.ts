import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { 
    createSuperAdmin, 
    createEmployee, 
    updateBySuperAdminorHR, 
    selfUpdateByEmployee,
    deleteEmployee,
    getAllEmployees,
    getEmployeeByDepartment,
    getEmployeeByDesignation,
    getEmployeeByStatus,
    getEmployeeProfile,
    getEmployeeProfilebyId,
    getEmployeeByRole
} from "../controllers/employee.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/create-super-admin").post(
    upload.single("profileImage"),
    createSuperAdmin
);


//secured routes

router.route("/create-employee").post(
    authenticate,
    upload.single("profileImage"),
    createEmployee
);

router.route("/update-employee/:employeeId").put(
    authenticate,
    upload.single("profileImage"),
    updateBySuperAdminorHR
);

router.route("/self-update-employee").put(
    authenticate,
    upload.single("profileImage"),
    selfUpdateByEmployee
);

router.route("/delete-employee/:employeeId").put(
    authenticate,
    deleteEmployee
);

router.route("/get-all-employees").get(
    authenticate,
    getAllEmployees
);

router.route("/get-employee-by-role/:role").get(
    authenticate,
    getEmployeeByRole
);

router.route("/get-employee-by-department/:department").get(
    authenticate,
    getEmployeeByDepartment
);

router.route("/get-employee-by-designation/:designation").get(
    authenticate,
    getEmployeeByDesignation
);

router.route("/get-employee-by-status/:status").get(
    authenticate,
    getEmployeeByStatus
);

router.route("/get-employee-profile").get(
    authenticate,
    getEmployeeProfile
);

router.route("/get-employee-profile/:employeeId").get(
    authenticate,
    getEmployeeProfilebyId
);

export default router;


