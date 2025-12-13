import pool from "../database/database.js";

// Controller to fetch todos for the logged-in user
async function getTodos(req, res) {
    try {
        const { status, priority } = req.query; // optional filters

        let query = "SELECT * FROM todos WHERE user_id = $1";
        const params = [req.user_id];
        let paramIndex = 2;

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (priority) {
            query += ` AND priority = $${paramIndex}`;
            params.push(priority);
            paramIndex++;
        }

        query += " ORDER BY due_date ASC, created_at DESC";

        const result = await pool.query(query, params);

        return res.status(200).json({
            todos: result.rows
        });

    } catch (error) {
        console.error("Error fetching todos:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default getTodos;
