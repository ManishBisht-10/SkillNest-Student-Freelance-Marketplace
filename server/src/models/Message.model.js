import mongoose from "mongoose";

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    chatRoomId: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "", trim: true, maxlength: 5000 },
    attachmentUrl: { type: String, default: "" },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

MessageSchema.index({ chatRoomId: 1, createdAt: -1 });

const Message = mongoose.model("Message", MessageSchema);
export default Message;

