import pool from "../database/database.js";
import jwt from "jsonwebtoken";

async function verifycode(req, res) {
    try {
        const { code, token, email } = req.body;

        // 1. Validate input
        if (!code || !token || !email) {
            return res.status(400).json({ message: "Please provide all the details" });
        }

        // 2. Fetch user from DB
        const result = await pool.query(
            "SELECT * FROM todo_email_verification WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Email not found" });
        }

        const user = result.rows[0];

        // 3. Check token
        if (token !== user.token) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // 4. Check OTP code
        if (parseInt(code) !==  parseInt(user.code)) {
            return res.status(401).json({ message: "Invalid code" });
        }
            const token1= jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

        await pool.query("UPDATE todo_email_verification SET verified = true , token = $2 WHERE email = $1", [
            email,token1
        ]) 

        // 5. Generate final login token
       

        return res.status(200).json({
            message: "Verified successfully",
            token: token1
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default verifycode;
