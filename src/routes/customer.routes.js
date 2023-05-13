import { Router } from "express"
import { createNewCustomer, getCustomerById, getCustomers, updateCustomer } from "../controllers/customers.controllers.js"
import { validateSchema } from "../middlewares/validateSchema.js"
import { customerSchema } from "../schemas/customers.schema.js"

const customerRoutes = Router()

customerRoutes.post("/customers", validateSchema(customerSchema), createNewCustomer)
customerRoutes.get("/customers", getCustomers)
customerRoutes.get("/customers/:id", getCustomerById)
customerRoutes.put("/customers/:id", validateSchema(customerSchema), updateCustomer)

export default customerRoutes