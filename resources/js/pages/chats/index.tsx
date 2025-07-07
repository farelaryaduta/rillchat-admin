import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import type { ChatMessage, FirebaseUser } from '@/types/firebase';
import { Search, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

interface ChatMessageWithUser extends ChatMessage {
    sender: FirebaseUser;
    receiver: FirebaseUser;
}

export default function Chats() {
    const [messages, setMessages] = useState<Record<string, ChatMessageWithUser>>({});
    const [users, setUsers] = useState<Record<string, FirebaseUser>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMessages, setFilteredMessages] = useState<Record<string, ChatMessageWithUser>>({});

    useEffect(() => {
        // Listen to users data first
        const usersRef = ref(db, 'users');
        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                setUsers(snapshot.val());
            }
        });

        // Then listen to messages with user data
        const messagesRef = ref(db, 'messages');
        const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));
        
        const unsubscribeMessages = onValue(messagesQuery, (snapshot) => {
            if (snapshot.exists()) {
                const messagesData = snapshot.val();
                const messagesWithUsers = Object.entries(messagesData).reduce((acc, [id, message]) => {
                    const msg = message as ChatMessage;
                    acc[id] = {
                        ...msg,
                        sender: users[msg.senderId],
                        receiver: users[msg.receiverId],
                    };
                    return acc;
                }, {} as Record<string, ChatMessageWithUser>);
                setMessages(messagesWithUsers);
            }
        });

        return () => {
            unsubscribeUsers();
            unsubscribeMessages();
        };
    }, []);

    useEffect(() => {
        const filtered = Object.entries(messages).reduce((acc, [id, message]) => {
            if (
                message.sender?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.receiver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.content.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                acc[id] = message;
            }
            return acc;
        }, {} as Record<string, ChatMessageWithUser>);

        setFilteredMessages(filtered);
    }, [messages, searchTerm]);

    return (
        <>
            <Head title="Chat Monitor" />

            <div className="max-w-7xl mx-auto py-6 space-y-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Chat Monitor</h2>
                        <div className="flex items-center space-x-2">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(filteredMessages).map(([id, message]) => (
                                    <TableRow key={id}>
                                        <TableCell>
                                            <div className="font-medium">{message.sender?.name}</div>
                                            <div className="text-sm text-muted-foreground">{message.sender?.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{message.receiver?.name}</div>
                                            <div className="text-sm text-muted-foreground">{message.receiver?.email}</div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="truncate">{message.content}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={message.read ? 'success' : 'secondary'}>
                                                {message.read ? (
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <Clock className="mr-1 h-3 w-3" />
                                                )}
                                                {message.read ? 'Read' : 'Unread'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(message.timestamp).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm">
                                                View Chat
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </>
    );
} 