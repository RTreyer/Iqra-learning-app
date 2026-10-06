import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import progressRouter from "./progress";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(progressRouter);
// Stats API at /api/admin/stats (token-protected, no user session required)
router.use("/admin", adminRouter);

export default router;
