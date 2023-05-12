import express from "express"
import router from "./routes/index.routes.js"

const app = express()

app.use(express.json())
app.use(router)

const PORT = 4000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))