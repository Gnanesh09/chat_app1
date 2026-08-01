import { Router } from "express";
import { getChats, getOrCreateChat } from "../controllers/chatController";
import { protectRoute } from "../middleware/auth";

const router = Router()


router.get("/", protectRoute,getChats)
router.post("/with/:participantId", protectRoute,getOrCreateChat)
export default router

