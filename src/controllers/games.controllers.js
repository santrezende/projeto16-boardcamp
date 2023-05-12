import { db } from "../database/database.connection.js"

export async function createGame(req, res) {
    const { name, image, stockTotal, pricePerDay } = req.body
    
    try{

        const existingGame = await db.query('SELECT * FROM games WHERE name = $1', [name])

        if(existingGame.rows.length > 0) return res.status(409).send("Existe um jogo com esse nome. Escolha outro nome e tente novamente")

        const query = 'INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4);'
        const values = [name, image, stockTotal, pricePerDay]
        await db.query(query, values)

        return res.sendStatus(201)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function getGames(req, res) {
    try {

        const games = await db.query(`SELECT * FROM games;`)
        return res.status(200).send(games.rows)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}