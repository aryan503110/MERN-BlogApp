import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  file: { type: String },
});

export default mongoose.model("Post", postSchema);
