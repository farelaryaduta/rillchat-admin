import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, limit, startAfter, getDocs } from 'firebase/firestore';
import { getInitials } from '@/hooks/use-initials';
import { Search, Users, Clock, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import debounce from 'lodash/debounce';

interface Message {
    id: string;
    message: string;
    senderId: string;
    receiverId: string;
    timestamp: Timestamp;
    senderName?: string;
    receiverName?: string;
}

const MESSAGES_PER_PAGE = 10;

export default function Messages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);
    const [lastVisible, setLastVisible] = useState<any>(null);

    // Cache for user data to prevent unnecessary re-renders
    const userCache = new Map();

    useEffect(() => {
        // Get users once and cache them
        const usersRef = collection(db, 'users');
        const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
            const usersData: Record<string, any> = {};
            snapshot.docs.forEach(doc => {
                usersData[doc.id] = doc.data();
            });
            setUsers(usersData);
        });

        // Get total message count
        const fetchTotalCount = async () => {
            const [chatSnapshot, conversationsSnapshot] = await Promise.all([
                getDocs(collection(db, 'chat')),
                getDocs(collection(db, 'conversations'))
            ]);
            setTotalMessages(chatSnapshot.size + conversationsSnapshot.size);
        };
        fetchTotalCount();

        return () => {
            unsubscribeUsers();
        };
    }, []);

    // Fetch paginated messages
    useEffect(() => {
        setLoading(true);
        
        const fetchMessages = async () => {
            const chatRef = collection(db, 'chat');
            const conversationsRef = collection(db, 'conversations');
            
            const chatQuery = query(
                chatRef,
                orderBy('timestamp', 'desc'),
                limit(MESSAGES_PER_PAGE)
            );
            
            const conversationsQuery = query(
                conversationsRef,
                orderBy('timestamp', 'desc'),
                limit(MESSAGES_PER_PAGE)
            );

            const [chatSnapshot, conversationsSnapshot] = await Promise.all([
                getDocs(chatQuery),
                getDocs(conversationsQuery)
            ]);

            const chatMessages = chatSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    message: data.message,
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    timestamp: data.timestamp,
                    senderName: users[data.senderId]?.name,
                    receiverName: users[data.receiverId]?.name,
                } as Message;
            });

            const conversationMessages = conversationsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    message: data.lastMessage,
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    timestamp: data.timestamp,
                    senderName: users[data.senderId]?.name,
                    receiverName: users[data.receiverId]?.name,
                } as Message;
            });

            const allMessages = [...chatMessages, ...conversationMessages]
                .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
                .slice(0, MESSAGES_PER_PAGE);

            setMessages(allMessages);
            setLastVisible(allMessages[allMessages.length - 1]?.timestamp);
            setLoading(false);
        };

        fetchMessages();
    }, [users, currentPage]);

    // Debounced search
    const debouncedSearch = debounce((searchTerm: string) => {
        if (!searchTerm.trim()) {
            setFilteredMessages(messages);
            return;
        }

        const filtered = messages.filter(message => 
            message.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMessages(filtered);
    }, 300);

    useEffect(() => {
        debouncedSearch(searchTerm);
        return () => {
            debouncedSearch.cancel();
        };
    }, [messages, searchTerm]);

    const handleNextPage = () => {
        if (messages.length === MESSAGES_PER_PAGE) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const getRecentMessages = () => {
        const now = new Date();
        return messages.filter(msg => {
            const msgTime = msg.timestamp.toDate();
            const diffInHours = Math.abs(now.getTime() - msgTime.getTime()) / 36e5;
            return diffInHours <= 24;
        }).length;
    };

    const getMessagesToday = () => {
        const today = new Date();
        return messages.filter(msg => {
            const msgDate = msg.timestamp.toDate();
            return today.toDateString() === msgDate.toDateString();
        }).length;
    };

    return (
        <>
            <Head title="Messages" />

            <div className="max-w-7xl mx-auto py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                                <h3 className="text-2xl font-bold">{totalMessages}</h3>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Recent Messages</p>
                                <h3 className="text-2xl font-bold">{getRecentMessages()}</h3>
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
                                <h3 className="text-2xl font-bold">{getMessagesToday()}</h3>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">Messages</h2>
                            <p className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * MESSAGES_PER_PAGE + 1} - {Math.min(currentPage * MESSAGES_PER_PAGE, totalMessages)} of {totalMessages} messages
                            </p>
                        </div>
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
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            Loading messages...
                                        </TableCell>
                                    </TableRow>
                                ) : (filteredMessages.map((message) => (
                                    <TableRow key={message.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarImage src={users[message.senderId]?.photoURL} alt={message.senderName} />
                                                    <AvatarFallback>{getInitials(message.senderName || '')}</AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium">{message.senderName || 'Unknown'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarImage src={users[message.receiverId]?.photoURL} alt={message.receiverName} />
                                                    <AvatarFallback>{getInitials(message.receiverName || '')}</AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium">{message.receiverName || 'Unknown'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="truncate">{message.message}</p>
                                        </TableCell>
                                        <TableCell>
                                            {message.timestamp.toDate().toLocaleDateString('en-US', {
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
                                )))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <Button
                            variant="outline"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage}
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={messages.length < MESSAGES_PER_PAGE}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    );
} 