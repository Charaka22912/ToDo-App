import express from "express";
import sql from "mssql";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database Configuration
const dbConfig = {
    user: "charaka",
    password: "123",
    server: "localhost",
    database: "TaskDB",
    options: {
        trustServerCertificate: true,
        encrypt: false, // Disable encryption for local dev
    }
};

// Establish connection to the database once
let pool;

async function connectDB() {
    try {
        pool = await sql.connect(dbConfig); // Use dbConfig here
        console.log("Connected to SQL Server");
    } catch (error) {
        console.error("Database connection error:", error);
    }
}

// Call the connectDB function to establish the connection when the server starts
connectDB();

// API Route to Save Task
app.post("/add-task", async (req, res) => {
    try {
        const { task, dueDate } = req.body;

        if (!task) {
            return res.status(400).json({ message: "Task cannot be empty" });
        }
        if (!dueDate) {
            return res.status(400).json({ message: "Due date is required" });
        }

        const request = pool.request();
        await request
            .input("task", sql.NVarChar, task)
            .input("create_by", sql.Date, dueDate)
            .query("INSERT INTO Task (task, create_by) VALUES (@task, @create_by)");

        res.status(201).json({ message: "Task added successfully", task, dueDate });
    } catch (error) {
        console.error("Error saving task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// API Route to Get All Tasks
app.get("/task", async (req, res) => {
    try {
        const request = pool.request();
        const result = await request.query("SELECT * FROM Task");
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// API Route to Delete Task
app.delete('/task/:id', async (req, res) => {
    const taskId = req.params.id;

    try {
        const request = pool.request();
        const result = await request
            .input('taskId', sql.Int, taskId)  // use sql.Int here to ensure proper data type
            .query('DELETE FROM Task WHERE id = @taskId');

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: 'Error deleting task' });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
