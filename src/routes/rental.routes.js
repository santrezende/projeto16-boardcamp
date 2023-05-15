import { Router } from "express"
import { addRental, deleteRental, endRental, getRentals } from "../controllers/rentals.controllers.js"

const rentalRoutes = Router()

rentalRoutes.post("/rentals", addRental)
rentalRoutes.get("/rentals", getRentals)
rentalRoutes.post("/rentals/:id/return", endRental)
rentalRoutes.delete("/rentals/:id", deleteRental)

export default rentalRoutes