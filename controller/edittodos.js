import pool from "../database/database.js";

// Controller to edit a todo
async function updateTodo(req, res) {
    try {
        const { id } = req.params; // todo ID
        const { title, description, priority, status, due_date } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Todo ID is required" });
        }

        // At least one field must be provided
        if (!title && !description && !priority && !status && !due_date) {
            return res.status(400).json({ message: "Nothing to update" });
        }

        const result = await pool.query(
            `
            UPDATE todos
            SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                priority = COALESCE($3, priority),
                status = COALESCE($4, status),
                due_date = COALESCE($5, due_date),
                updated_at = NOW()
            WHERE id = $6 AND user_id = $7
            RETURNING *
            `,
            [
                title ?? null,
                description ?? null,
                priority ?? null,
                status ?? null,
                due_date ?? null,
                id,
                req.user_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Todo not found or not authorized"
            });
        }

        return res.status(200).json({
            message: "Todo updated successfully",
            todo: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating todo:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default updateTodo;
