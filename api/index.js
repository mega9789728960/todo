import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import loginRouter from "../router/login.js";
import sendcodeRouter from "../router/sendcode.js";
import registerRouter from "../router/register.js";
import verifyRouter from "../router/verifycode.js";
import todoRouter from "../router/todo.js";

dotenv.config();

const app = express();

// 🔥 CORS — allow all origins (including localhost & Vercel)
app.use(cors({
  origin: true,          // allow all origins dynamically
  credentials: true,     // allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔥 Handle preflight requests
app.options("*", cors());

// Body & cookies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(loginRouter);
app.use(sendcodeRouter);
app.use(registerRouter);
app.use(verifyRouter);
app.use("/todo", todoRouter);

export default app;
