import pool from "../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function login(req, res) {
    try {
        // ------------------------------
        // 1. CHECK IF TOKEN ALREADY EXISTS IN COOKIE
        // ------------------------------
        const existingToken = req.cookies?.token;

        if (existingToken) {
            try {
                const decoded = jwt.verify(existingToken, process.env.JWT_SECRET_KEY);

                // Verify session exists in DB
                const sessionResult = await pool.query(
                    "SELECT * FROM todo_session WHERE token = $1 AND user_id = $2",
                    [existingToken, decoded.id]
                );

                if (sessionResult.rows.length > 0) {
                    // Auto-login success
                    const userResult = await pool.query(
                        "SELECT id, email, username FROM todo_users WHERE id = $1",
                        [decoded.id]
                    );

                    const user = userResult.rows[0];

                    return res.status(200).json({
                        message: "Auto login successful",
                        user
                    });
                }
            } catch (err) {
                // token invalid → ignore and continue normal login flow
            }
        }

        // ------------------------------
        // 2. NORMAL LOGIN WITH EMAIL/PASSWORD
        // ------------------------------
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const result = await pool.query(
            "SELECT * FROM todo_users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate fresh JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "2h" }
        );

        // Get device info
        const deviceName = (req.headers['user-agent'] || "Unknown Device").slice(0, 200);
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown IP";

        // Store session
        await pool.query(
            "INSERT INTO todo_session (device_name, token, user_id, ip_address, created_at) VALUES ($1,$2,$3,$4,NOW())",
            [deviceName, token, user.id, ipAddress]
        );

        // Send cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            user: {
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default login;
