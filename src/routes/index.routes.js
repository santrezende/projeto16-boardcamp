import { Router } from "express"
import gamesRouter from "./games.routes.js"
import customerRoutes from "./customer.routes.js"
import rentalRoutes from "./rental.routes.js"

const router = Router()
router.use(gamesRouter)
router.use(customerRoutes)
router.use(rentalRoutes)

export default router