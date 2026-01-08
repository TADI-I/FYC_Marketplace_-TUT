// types.ts - Create this file in your src folder

export type User = {
  id: number;
  name: string;
  email: string;
  type: string;
  subscribed: boolean;
  campus: string;
};

export type Product = {
  id: number;
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  sellerId: number;
  sellerName: string;
  sellerCampus: string;
  image?: {
    id: string;
    filename: string;
    contentType: string;
    uploadDate: Date;
  };
  imageUrl?: string;
  rating: number;
  type: string;
};

export type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
  read: boolean;
};

export type MessageMap = {
  [key: string]: Message[];
};

export type Category = {
  id: string;
  name: string;
};

export type Campus = {
  id: string;
  name: string;
};