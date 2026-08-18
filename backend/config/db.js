import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();
const connectDb = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL);
        console.log("db connected");
    }
    catch (err) {
        console.log("db_error");
    }
}
export default connectDb;