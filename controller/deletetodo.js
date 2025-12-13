import pool from "../database/database.js";

// Controller to delete a todo
async function deleteTodo(req, res) {
    try {
        const { id } = req.params; // todo ID from URL

        if (!id) {
            return res.status(400).json({ message: "Todo ID is required" });
        }

        // Delete only if the todo belongs to the logged-in user
        const result = await pool.query(
            "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Todo not found or not authorized" });
        }

        return res.status(200).json({ message: "Todo deleted successfully", todo: result.rows[0] });

    } catch (error) {
        console.error("Error deleting todo:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default deleteTodo;
