import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { db } from '@/lib/firebase';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import type { ChatMessage } from '@/types/firebase';
import { Search, Users, Clock, MessageSquare } from 'lucide-react';

export default function Conversations() {
    const [messages, setMessages] = useState<Record<string, ChatMessage>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMessages, setFilteredMessages] = useState<Record<string, ChatMessage>>({});

    useEffect(() => {
        // Listen to messages data
        const messagesRef = ref(db, 'messages');
        const messagesQuery = query(messagesRef, orderByChild('timestamp'));
        
        const unsubscribeMessages = onValue(messagesQuery, (snapshot) => {
            if (snapshot.exists()) {
                setMessages(snapshot.val());
            }
        });

        return () => {
            unsubscribeMessages();
        };
    }, []);

    useEffect(() => {
        const filtered = Object.entries(messages).reduce((acc, [id, message]) => {
            if (
                message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                acc[id] = message;
            }
            return acc;
        }, {} as Record<string, ChatMessage>);

        setFilteredMessages(filtered);
    }, [messages, searchTerm]);

    const getMessageStatus = (timestamp: string) => {
        const messageTime = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - messageTime.getTime()) / 36e5;
        return diffInHours <= 24 ? 'Recent' : 'Old';
    };

    return (
        <>
            <Head title="Conversations" />

            <div className="max-w-7xl mx-auto py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                                <h3 className="text-2xl font-bold">{Object.keys(messages).length}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Conversations</p>
                                <h3 className="text-2xl font-bold">
                                    {Object.values(messages).filter(msg => getMessageStatus(msg.timestamp) === 'Recent').length}
                                </h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Messages Today</p>
                                <h3 className="text-2xl font-bold">
                                    {Object.values(messages).filter(msg => {
                                        const today = new Date();
                                        const msgDate = new Date(msg.timestamp);
                                        return today.toDateString() === msgDate.toDateString();
                                    }).length}
                                </h3>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Messages</h2>
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
                                    <TableHead>Time</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(filteredMessages).map(([id, message]) => (
                                    <TableRow key={id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <img
                                                        src={message.senderImage}
                                                        alt={message.senderName}
                                                        className="aspect-square h-full w-full"
                                                    />
                                                </Avatar>
                                                <div className="font-medium">{message.senderName}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <img
                                                        src={message.receiverImage}
                                                        alt={message.receiverName}
                                                        className="aspect-square h-full w-full"
                                                    />
                                                </Avatar>
                                                <div className="font-medium">{message.receiverName}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="truncate">{message.lastMessage}</p>
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
                                                View Details
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