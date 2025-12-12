import pool from "../database/database.js";
import bcrypt from "bcrypt";

async function register(req, res) {
    try {
        const { email, token, username, password } = req.body;

        // 1. Validate input
        if (!email || !password || !username || !token) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        // 2. Check if email exists in verification table
        const result = await pool.query(
            "SELECT * FROM todo_email_verification WHERE email = $1",
            [email]
        );

     

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Email not found or OTP not sent" });
        }
        if(result.rows[0].verified != true){
            return res.status(403).json({message:"Account is not verified"})
        }

        const verifyData = result.rows[0];

        // 3. Check token validity
        if (token !== verifyData.token) {
            return res.status(403).json({ message: "Invalid token" });
        }

        // 4. Check if user already exists
        const existingUser = await pool.query(
            "SELECT * FROM todo_users WHERE email = $1 OR username = $2",
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: "Email or username already in use" });
        }

        // 5. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Insert user into DB
        await pool.query(
            "INSERT INTO todo_users (email, username, password) VALUES ($1, $2, $3)",
            [email, username, hashedPassword]
        );

        // 7. Delete verification record (optional but better security)
        await pool.query("DELETE FROM todo_email_verification WHERE email = $1", [email]);

        return res.json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default register;
