// import { getReceiverSocketId, io } from "../index.js";
// import { Conversation } from "../models/conversationModel.js";
// import { Message } from "../models/messageModel.js";

//Send message => api/v1/message/send/:id
// export const sendMessage = async (req, res) => {
//   try {
//     const senderId = req.id;
//     const receiverId = req.params.id;
//     const { message } = req.body;

//     let getUserConversation = await Conversation.findOne({
//       participants: { $all: [senderId, receiverId] },
//     });

//     if (!getUserConversation) {
//       getUserConversation = await Conversation.create({
//         participants: [senderId, receiverId],
//       });
//     }

//     const newMessage = await Message.create({
//       senderId,
//       receiverId,
//       message,
//     });

//     if (newMessage) {
//       getUserConversation.messages.push(newMessage._id);
//     }

//     getUserConversation.save();

//     //socket.io
//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }

//     return res.status(201).json({
//       newMessage,
//       message: "Message send successfully",
//       success: true,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };
import { getReceiverSocketId, io } from "../index.js";
import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({ senderId, receiverId, message });
    conversation.messages.push(newMessage._id);
    await conversation.save();

    // Emit real-time message to the receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

//Get message => api/v1/message/:id
export const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");
    console.log(conversation.messages);

    return res.status(200).json(conversation?.messages);
  } catch (error) {
    console.log(error);
  }
};
