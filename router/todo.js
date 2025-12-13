import express from "express";
import addTodo from "../controller/addtodo.js";
import getTodos from "../controller/fetchtodo.js";
import updateTodo from "../controller/edittodos.js";
import deleteTodo from "../controller/deletetodo.js";
import authmiddleware from "../controller/authmiddleware.js";

const todoRouter = express.Router();

todoRouter.use(authmiddleware);

// Create a new todo
todoRouter.post("/", addTodo);

// Fetch all todos
todoRouter.get("/", getTodos);

// Update a todo by ID
todoRouter.put("/:id", updateTodo);

// Delete a todo by ID
todoRouter.delete("/:id", deleteTodo);

export default todoRouter;
