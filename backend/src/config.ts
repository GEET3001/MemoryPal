import dotenv from "dotenv";
dotenv.config();

export const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/memory-pal";
export const JWT_PASSWORD = process.env.JWT_PASSWORD || "default_secret";
export const PORT = process.env.PORT || 3000;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
