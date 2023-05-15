import { db } from "../database/database.connection.js"
import dayjs from "dayjs"

export async function addRental (req, res) {
    const { customerId, gameId, daysRented } = req.body

    if(daysRented <= 0) return res.status(400).send("daysRented should be a positive number")

    try {
        const verificationGame = await db.query(`SELECT * FROM games WHERE id = $1`, [gameId])
        const verificationCustomer = await db.query(`SELECT * FROM customers WHERE id = $1`, [customerId])

        if(!verificationGame.rows[0] || !verificationCustomer.rows[0]) return res.status(400).send("game or customer not found")

        const verificationRentals = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1 AND "returnDate" IS NULL;`, [gameId])

        if (verificationRentals.rows.length >= verificationGame.rows[0].stockTotal) return res.status(400).send("game out of stock")

        const pricePerDay = verificationGame.rows[0].pricePerDay
        const originalPrice = pricePerDay * daysRented
        const rentDate = dayjs().format("YYYY-MM-DD")
        const returnDate = null
        const delayFee = null

        const values = [
            customerId,
            gameId,
            rentDate,
            daysRented,
            returnDate,
            originalPrice,
            delayFee
        ]

        await db.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
        VALUES ($1, $2, $3, $4, $5, $6, $7);`, values)

        return res.sendStatus(201)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function getRentals (req, res) {
    const { order, desc } = req.query
    let query = `SELECT rentals.*,
    customers.name AS "customerName", 
    games.name AS "gameName" 
    FROM rentals 
    JOIN customers ON customers.id = rentals."customerId"
    JOIN games ON games.id = rentals."gameId"`

    const filters = [
        "id",
        "customerId",
        "gameId",
        "rentDate",
        "daysRented",
        "returnDate",
        "originalPrice",
        "delayFee",
        "customer_name",
        "game_name",
      ]

    if(order && filters.includes(order)) {

    query += ` ORDER BY "${order}"${desc === "true" ? ` DESC` : ``}`
    }
    query += `;`

    try{
        const result = await db.query(query)

        const rentals = result.rows.map(rental => ({
            id: rental.id,
            customerId: rental.customerId,
            gameId: rental.gameId,
            rentDate: dayjs(rental.rentDate).format("YYYY-MM-DD"),
            daysRented: rental.daysRented,
            returnDate: rental.returnDate,
            originalPrice: rental.originalPrice,
            delayFee: rental.delayFee,
            customer: {
                id: rental.customerId,
                name: rental.customerName,
            },
            game: {
              id: rental.gameId,
              name: rental.gameName,
            }
        }))

        return res.status(200).send(rentals)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function endRental (req, res) {
    const { id } = req.params
    const returnDate = new Date()

    try{
        const rental = await db.query(`
        SELECT rentals.*, games."pricePerDay"
        FROM rentals 
        JOIN games ON games.id = rentals."gameId"
        WHERE rentals.id = $1;`, [id])

        if(rental.rowCount === 0) return res.status(404).send("rental not found")
        if(rental.rows[0].returnDate !== null) return res.status(400).send("rental already ended")

        const rentDate = rental.rows[0].rentDate

        const diffMs = returnDate.getTime() - rentDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        let delayFee = null
        
        if(diffDays > rental.rows[0].daysRented) delayFee = rental.rows[0].pricePerDay * (diffDays - rental.rows[0].daysRented)

        await db.query(`
        UPDATE rentals 
        SET "returnDate" = $1, "delayFee" = $2 
        WHERE id = $3;`, [dayjs(returnDate).format("YYYY-MM-DD"), delayFee, id])

        return res.sendStatus(200)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function deleteRental (req, res) {
    const { id } = req.params

    try {
        const rentalToDelete = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id])

        if(rentalToDelete.rowCount === 0) return res.status(404).send("rental not found")
        if(rentalToDelete.rows[0].returnDate === null) return res.status(400).send("rental is not ended")

        await db.query(`DELETE FROM rentals WHERE id = $1;`, [id])

        return res.sendStatus(200)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}