import { Timestamp } from 'firebase/firestore';

export interface FirebaseUser {
    email: string;
    name: string;
    nim: string;
    profilePicture: string;
    fcmToken: string;
    createdAt: string;
    lastActive: string;
    availability: number; // 0 = offline, 1 = online
}

export interface ChatMessage {
    id: string;
    lastMessage: string;
    receiverId: string;
    receiverImage: string;
    receiverName: string;
    senderId: string;
    senderImage: string;
    senderName: string;
    timestamp: Timestamp;
}

export interface Conversation {
    id: string;
    lastMessage: string;
    participants: {
        id: string;
        name: string;
        image: string;
    }[];
    timestamp: string;
}

export interface ChatAnalytics {
    totalMessages: number;
    activeUsers: number;
    averageResponseTime: number;
    messagesByDate: Record<string, number>;
}

export interface UserAnalytics {
    totalUsers: number;
    activeToday: number;
    newUsersToday: number;
    usersByDate: Record<string, number>;
    active24h?: number;
}

export interface ConversationAnalytics {
    totalConversations: number;
    activeConversations: number;
    averageDuration: number;
    conversationsByDate: Record<string, number>;
}

export interface User {
    password: ReactNode;
    nim: ReactNode;
    id: string;
    name: string;
    email: string;
    photoURL: string;
    createdAt: Timestamp;
    lastActive: Timestamp;
    availability: number; // 0 = offline, 1 = online
} 