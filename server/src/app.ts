import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";
import userRouter from "./routes/user.routes.js";
import candidateRouter from "./routes/candidate.routes.js"

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/candidates", candidateRouter)

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode =
    error instanceof ApiError ? error.statusCode : 500;

  return res.status(statusCode).json({
    statusCode,
    data: error instanceof ApiError ? error.data : null,
    message:
      error instanceof Error ? error.message : "Internal server error",
    success: false,
    errors: error instanceof ApiError ? error.errors : [],
  });
};

app.use(errorHandler);

export { app };
