import { Router } from "express"
import gamesRouter from "./games.routes.js"
import customerRoutes from "./customer.routes.js"

const router = Router()
router.use(gamesRouter)
router.use(customerRoutes)

export default router