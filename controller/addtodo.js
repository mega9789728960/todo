import pool from "../database/database.js";

// Controller to add a new todo using user_id from JWT
async function addTodo(req, res) {
    try {
        const { title, description, priority, due_date } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const result = await pool.query(
            `INSERT INTO todos (user_id, title, description, priority, due_date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [req.user_id, title, description || null, priority || 'medium', due_date || null]
        );

        return res.status(201).json({
            message: "Todo created successfully",
            todo: result.rows[0]
        });

    } catch (error) {
        console.error("Error adding todo:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default addTodo;
