import { Router } from "express";
import { getChats, getOrCreateChat } from "../controllers/chatController";

const router = Router()


router.get("/", getChats)
router.post("/with/:participantId", getOrCreateChat)
export default router

