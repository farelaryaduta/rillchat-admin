import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, getDocs, where } from 'firebase/firestore';
import type { UserAnalytics, ChatAnalytics, ConversationAnalytics } from '@/types/firebase';
import { Users, MessageSquare, MessagesSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CHART_THEME = {
    stroke: '#2563eb', // Blue-600
    fill: 'rgba(37, 99, 235, 0.15)', // Blue-600 with opacity
    background: 'transparent',
    text: '#9ca3af', // Gray-400
};

export default function Dashboard() {
    const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
        totalUsers: 0,
        activeToday: 0,
        newUsersToday: 0,
        usersByDate: {}
    });
    const [chatAnalytics, setChatAnalytics] = useState<ChatAnalytics>({
        totalMessages: 0,
        activeUsers: 0,
        averageResponseTime: 0,
        messagesByDate: {}
    });
    const [conversationAnalytics, setConversationAnalytics] = useState<ConversationAnalytics>({
        totalConversations: 0,
        activeConversations: 0,
        averageDuration: 0,
        conversationsByDate: {}
    });

    useEffect(() => {
        // Calculate today's date at midnight for consistent comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Listen to users collection for real-time updates
        const usersRef = collection(db, 'users');
        const unsubscribeUsers = onSnapshot(usersRef, async (snapshot) => {
            const users = snapshot.docs;
            const totalUsers = users.length;
            
            // Count users currently online (lastActive within 30 seconds)
            const now = Date.now();
            const onlineUsers = users.filter(doc => {
                let lastActive = doc.data().lastActive;
                if (!lastActive) return false;
                if (typeof lastActive?.toDate === 'function') {
                    lastActive = lastActive.toDate();
                } else {
                    lastActive = new Date(lastActive);
                }
                if (isNaN(lastActive.getTime())) return false;
                // Consider online if lastActive within last 30 seconds
                return (now - lastActive.getTime()) < 30 * 1000;
            }).length;

            // Count users active in last 24 hours
            const active24hUsers = users.filter(doc => {
                let lastActive = doc.data().lastActive;
                if (!lastActive) return false;
                // Handle Firestore Timestamp or string
                if (typeof lastActive?.toDate === 'function') {
                    lastActive = lastActive.toDate();
                } else {
                    lastActive = new Date(lastActive);
                }
                if (isNaN(lastActive.getTime())) return false;
                const hoursSinceActive = (now - lastActive.getTime()) / (1000 * 60 * 60);
                return hoursSinceActive <= 24;
            }).length;

            // Count new users today
            const newUsers = users.filter(doc => {
                const createdAt = doc.data().createdAt?.toDate();
                if (!createdAt) return false;
                return createdAt >= today;
            }).length;

            // Group users by date for the chart and calculate cumulative growth
            const sortedUsers = users
                .map(doc => ({
                    createdAt: doc.data().createdAt?.toDate(),
                }))
                .filter(user => user.createdAt)
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            const usersByDate: Record<string, number> = {};
            let cumulativeCount = 0;
            
            sortedUsers.forEach(user => {
                const date = user.createdAt.toISOString().split('T')[0];
                cumulativeCount++;
                usersByDate[date] = cumulativeCount;
            });

            setUserAnalytics({
                totalUsers,
                activeToday: onlineUsers,
                newUsersToday: newUsers,
                usersByDate,
                active24h: active24hUsers
            });
        });

        // Listen to chat collection for real-time updates
        const chatRef = collection(db, 'chat');
        const chatQuery = query(chatRef, orderBy('timestamp', 'desc'));
        
        const unsubscribeChat = onSnapshot(chatQuery, async (snapshot) => {
            const chatMessages = snapshot.docs;
            
            // Get messages from conversations collection
            const conversationsRef = collection(db, 'conversations');
            const conversationsQuery = query(conversationsRef, orderBy('timestamp', 'desc'));
            const conversationsSnapshot = await getDocs(conversationsQuery);
            const conversationMessages = conversationsSnapshot.docs;

            const totalMessages = chatMessages.length + conversationMessages.length;

            // Count active messages (in last 24h)
            const recentChatMessages = chatMessages.filter(doc => {
                const timestamp = doc.data().timestamp?.toDate();
                if (!timestamp) return false;
                return timestamp >= yesterday;
            }).length;

            const recentConversationMessages = conversationMessages.filter(doc => {
                const timestamp = doc.data().timestamp?.toDate();
                if (!timestamp) return false;
                return timestamp >= yesterday;
            }).length;

            // Group all messages by date for the chart
            const messagesByDate: Record<string, number> = {};
            [...chatMessages, ...conversationMessages].forEach(doc => {
                const timestamp = doc.data().timestamp?.toDate();
                if (timestamp) {
                    const date = timestamp.toISOString().split('T')[0];
                    messagesByDate[date] = (messagesByDate[date] || 0) + 1;
                }
            });

            setChatAnalytics(prev => ({
                ...prev,
                totalMessages,
                activeUsers: recentChatMessages + recentConversationMessages,
                messagesByDate
            }));

            // Count active conversations
            const activeConversations = conversationMessages.filter(doc => {
                const timestamp = doc.data().timestamp?.toDate();
                if (!timestamp) return false;
                return timestamp >= yesterday;
            }).length;

            setConversationAnalytics(prev => ({
                ...prev,
                totalConversations: conversationMessages.length,
                activeConversations
            }));
        });

        return () => {
            unsubscribeUsers();
            unsubscribeChat();
        };
    }, []);

    const StatCard = ({ title, value, icon: Icon, description }: { title: string; value: number | string; icon: any; description: string }) => (
        <Card className="p-6 bg-card text-card-foreground shadow-sm">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </Card>
    );

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover p-2 rounded-lg shadow-md border border-border">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-base font-semibold text-foreground">
                        {payload[0].value} messages
                    </div>
                </div>
            );
        }
        return null;
    };

    const ChartCard = ({ title, data, dataKey }: { title: string; data: any[]; dataKey: string }) => (
        <Card className="p-6 bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.stroke} />
                        <XAxis 
                            dataKey="date" 
                            stroke={CHART_THEME.text}
                            tick={{ fill: CHART_THEME.text }}
                        />
                        <YAxis 
                            stroke={CHART_THEME.text}
                            tick={{ fill: CHART_THEME.text }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={CHART_THEME.stroke}
                            strokeWidth={2}
                            dot={{ fill: CHART_THEME.fill, r: 4 }}
                            activeDot={{ r: 6, fill: CHART_THEME.fill }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );

    const AnalyticsCard = ({
        title,
        value,
        subLabel,
        chartData,
        dataKey,
        hideValue = false
    }: {
        title: string;
        value?: number | string;
        subLabel?: string;
        chartData: any[];
        dataKey: string;
        hideValue?: boolean;
    }) => (
        <Card className="p-6 bg-card text-card-foreground shadow-sm flex flex-col justify-between min-h-[220px]">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                </div>
                {!hideValue && (
                    <>
                        <div className="text-3xl font-bold text-foreground">{value}</div>
                        <div className="text-xs text-muted-foreground mb-2">{subLabel}</div>
                    </>
                )}
            </div>
            <div className="h-[60px] w-full -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={CHART_THEME.stroke}
                            fillOpacity={1}
                            fill="url(#colorBlue)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={false}
                            isAnimationActive={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563eb', strokeWidth: 1, opacity: 0.2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );

    return (
        <>
            <Head title="Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={userAnalytics.totalUsers}
                        icon={Users}
                        description={`${userAnalytics.newUsersToday} new today`}
                    />
                    <StatCard
                        title="Active Users"
                        value={userAnalytics.activeToday}
                        icon={Users}
                        description="Online now"
                    />
                    <StatCard
                        title="Active Users (24h)"
                        value={userAnalytics.active24h || 0}
                        icon={Users}
                        description="Active in last 24h"
                    />
                    <StatCard
                        title="Total Messages"
                        value={chatAnalytics.totalMessages}
                        icon={MessageSquare}
                        description="All time messages"
                    />
                    <StatCard
                        title="Active Conversations"
                        value={conversationAnalytics.activeConversations}
                        icon={MessagesSquare}
                        description="Ongoing conversations"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnalyticsCard
                        title="Message Activity"
                        value={chatAnalytics.totalMessages}
                        subLabel="All time messages"
                        chartData={Object.entries(chatAnalytics.messagesByDate).map(([date, count]) => ({ date, count }))}
                        dataKey="count"
                    />
                    <AnalyticsCard
                        title="User Growth"
                        chartData={Object.entries(userAnalytics.usersByDate).map(([date, count]) => ({ date, count }))}
                        dataKey="count"
                        hideValue={true}
                    />
                </div>
            </div>
        </>
    );
}
