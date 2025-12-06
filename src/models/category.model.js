import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryId: Number,
    name: String
});

export default mongoose.model("Category", categorySchema);
