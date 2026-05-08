import mongoose from "mongoose";
import { UserModel } from "./db";
import { MONGO_URL } from "./config";

async function checkUsers() {
    await mongoose.connect(MONGO_URL);
    const users = await UserModel.find({});
    console.log("Users in DB:", users);
    await mongoose.disconnect();
}

checkUsers();
