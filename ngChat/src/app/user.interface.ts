export interface CommonUser {
  _id: string;
  username: string;
  email: string;
}

export interface UserMessage {
  body?: string;
  createAt: string;
  receiverId: string;
  roomId: string;
  senderId: string;
  imgPath?: string;
  videoPath?: string;
  audioPath?: string;
  type: string;
}
