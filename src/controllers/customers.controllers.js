import { db } from "../database/database.connection.js"

export async function createNewCustomer (req, res) {
    const { name, phone, cpf, birthday } = req.body

    try{
        const existingCustomer = await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf])
        if(existingCustomer.rows.length > 0) return res.status(409).send("Já existe uma conta com esse CPF.")

        const query = 'INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);'
        const values = [name, phone, cpf, birthday]
        await db.query(query, values)

        return res.sendStatus(201)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function getCustomers (req, res) {
    const { order, desc } = req.query
    let query = `SELECT id, name, phone, cpf, to_char(birthday, 'YYYY-MM-DD') as birthday FROM customers`

    const filters = ["id", "name", "phone", "cpf", "birthday"]

    if(order && filters.includes(order)) {
        query += ` ORDER BY "${order}"${desc === "true" ? ` DESC` : ``}`
    }
    query += `;`
    try {
        const customers = await db.query(query)
        return res.status(200).send(customers.rows)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function getCustomerById (req, res) {
    const { id } = req.params

    try{
        const customer = await db.query(`
        SELECT id, name, phone, cpf, to_char(birthday, 'YYYY-MM-DD')
        as birthday FROM customers WHERE id = $1;
        `, [id])

        if (customer.rows.length === 0) return res.status(404).send("customer not found")

        return res.status(200).send(customer.rows[0])
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function updateCustomer (req, res) {
    const { name, phone, cpf, birthday } = req.body
    const { id } = req.params
    
    try{

        const existingCustomer = await db.query(`SELECT * FROM customers WHERE cpf = $1 AND id != $2`, [cpf, id])
        if (existingCustomer.rows.length > 0) return res.status(409).send("Já existe uma conta com esse CPF.")

        const query = "UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5"
        const values = [name, phone, cpf, birthday, id]

        await db.query(query, values)
        res.sendStatus(200)

    } catch (err) {
        return res.status(500).send(err.message)
    }
}