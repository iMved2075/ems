import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";

import { loginEmployee, logoutEmployee } from "../controllers/employee.controller.js";

const router = Router();


router.route("/login").post(loginEmployee);
router.route("/logout").post(authenticate, logoutEmployee);

export default router;