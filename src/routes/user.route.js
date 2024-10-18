import { Router } from "express";
import { registerUser } from "../controllors/user.controllor.js";

const router = Router()

router.route("/register").post(registerUser)

export default router;