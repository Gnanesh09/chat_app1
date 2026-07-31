import { Router } from "express";
import { authCallback, getMe } from "../controllers/authController";
import { protectRoute } from "../middleware/auth";

const router = Router()


router.get("/me",protectRoute,getMe)
router.post("/callback",protectRoute,authCallback)
export default router