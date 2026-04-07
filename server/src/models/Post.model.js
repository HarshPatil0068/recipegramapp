import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    postType: {
      type: String,
      enum: ["recipe", "reel"],
      default: "recipe",
      index: true
    },
    caption: {
      type: String,
      required: true,
      maxlength: [2000, 'Caption cannot exceed 2000 characters']
    },
    ingredients: [String],
    steps: [String],
    image: {
      type: String
    },
    video: {
      type: String
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

// Enforce media requirements based on post type.
postSchema.pre("validate", function () {
  if (this.postType === "reel") {
    if (!this.video) {
      this.invalidate("video", "Video is required for reels");
    }
  } else if (!this.image) {
    this.invalidate("image", "Image is required for recipe posts");
  }
});

export default mongoose.model("Post", postSchema);
