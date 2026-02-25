import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, History, LayoutGrid, ShoppingCart } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as { auth: { canSeeApprovalRequests?: boolean } };
    const canSeeApproval = auth?.canSeeApprovalRequests ?? false;

    const mainNavItems: NavItem[] = [
        { title: 'لوحة التحكم', href: dashboard(), icon: LayoutGrid },
        { title: 'طلباتي', href: '/purchase-requests', icon: ShoppingCart },
        ...(canSeeApproval
            ? [
                  { title: 'الطلبات الحالية', href: '/purchase-requests/current', icon: ClipboardList },
                  { title: 'الطلبات السابقة', href: '/purchase-requests/past', icon: History },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" side="right">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
