import { Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, MessageSquare, Megaphone } from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

const items: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Messages',
        href: '/messages',
        icon: MessageSquare,
    },
    {
        title: 'Announcements',
        href: '/announcements',
        icon: Megaphone,
    },
];

interface NavMainProps {
    items?: NavItem[];
}
export function NavMain({ items: customItems }: NavMainProps) {
    const { url } = usePage();
    const pathname = url;
    const navItems = customItems || items;

    return (
        <nav className="grid gap-1">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                            isActive && 'bg-accent'
                        )}
                    >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
