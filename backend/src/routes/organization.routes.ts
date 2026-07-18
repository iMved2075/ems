import Router from 'express';
import { getOrganizationChart } from '../controllers/employee.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();


router.route("/tree").get(authenticate, getOrganizationChart);

export default router;