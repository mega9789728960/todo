import pool from "../database/database.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

async function sendcode(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

        const generateOTP = () => Math.floor(1000 + Math.random() * 9000);
        const code = generateOTP();

        const checkUser = await pool.query(
            "SELECT * FROM todo_email_verification WHERE email = $1",
            [email]
        );

        const now = new Date();

        function addMinutes(date, minutes) {
            return new Date(date.getTime() + minutes * 60000);
        }

        let otpToSend = code;

        if (checkUser.rows.length > 0) {
            const user = checkUser.rows[0];
            const lastRequestTime = new Date(user.created_at);

            if (addMinutes(lastRequestTime, 5) > now) {
                return res
                    .status(400)
                    .json({ message: "Please wait before requesting another OTP" });
            }

            otpToSend = generateOTP();

            await pool.query(
                `UPDATE todo_email_verification 
                 SET code = $1, created_at = NOW(), token = $2 ,verified = false
                 WHERE email = $3`,
                [otpToSend, token, email]
            );
        } else {
            await pool.query(
                `INSERT INTO todo_email_verification (email, code, created_at, token) 
                 VALUES ($1, $2, NOW(), $3)`,
                [email, otpToSend, token]
            );
        }

        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.PASS_KEY
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_ID,
            to: email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${otpToSend}`
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            token
        });

    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default sendcode;
