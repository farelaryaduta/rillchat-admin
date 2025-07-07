import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Header() {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        if (auth?.user?.id) {
            // Firestore user document IDs are usually strings (UIDs), but here it's a number. Adjust if needed.
            const userRef = doc(db, 'users', String(auth.user.id));
            updateDoc(userRef, { lastActive: new Date() });
        }
    }, [auth?.user?.id]);

    const handleLogout = () => {
        router.post(route('logout'), {}, {
            onSuccess: () => {
                router.visit(route('login'));
            },
            preserveScroll: true,
        });
    };

    return (
        <header className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-primary">
                            RillChat Admin
                        </Link>
                        {auth?.user && (
                            <nav className="hidden md:ml-8 md:flex md:space-x-4">
                                <Link
                                    href={route('dashboard')}
                                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('users')}
                                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10"
                                >
                                    Users
                                </Link>
                                <Link
                                    href={route('messages')}
                                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10"
                                >
                                    Messages
                                </Link>
                                <Link
                                    href={route('announcements')}
                                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/10"
                                >
                                    Announcements
                                </Link>
                            </nav>
                        )}
                    </div>

                    {auth?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{auth.user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{auth.user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')}>Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route('settings.appearance')}>Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <button className="flex w-full items-center" onClick={handleLogout}>
                                        <LogOut className="mr-2" />
                                        Log out
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('login')}
                                className="text-sm font-medium hover:text-primary"
                            >
                                Login
                            </Link>
                            <Link
                                href={route('register')}
                                className="text-sm font-medium hover:text-primary"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
} 