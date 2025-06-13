import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Routes

import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import noteRouter from "./routes/note.routes.js";
import taskRouter from "./routes/task.routes.js";
import { upload } from "./middlewares/multer.middlewares.js";

app.use("/api/v1/health-check", healthRouter);
app.use("/api/v1/user", authRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/note", noteRouter);
app.use("/api/v1/task", taskRouter);


app.use("/check-multer",upload.array("avatar",2),(req,res) =>{
    const photo = req.files
    console.log(photo)

    return res.status(200).json({
        message:"upload image",
        data : photo
    })
})

// Error Middleware

app.use(errorHandler);

export default app;
