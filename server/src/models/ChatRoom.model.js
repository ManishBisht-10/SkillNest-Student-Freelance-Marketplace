import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatRoomSchema = new Schema(
  {
    contractId: { type: Schema.Types.ObjectId, ref: "Contract", required: true, unique: true },
    participants: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
export default ChatRoom;

