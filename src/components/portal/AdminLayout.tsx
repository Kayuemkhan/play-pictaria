import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Archive,
  Bell,
  Building2,
  ExternalLink,
  History,
  Images,
  LayoutDashboard,
  ShieldCheck,
  Star,
  Ticket,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import turtleMascot from "@/assets/portal-turtle.webp";
import sharkMascot from "@/assets/portal-shark.webp";
import pandaMascot from "@/assets/portal-panda.webp";

const NAV_ITEMS = [
  { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portal/library", label: "Photo Library", icon: Images },
  { to: "/portal/daily", label: "Today's Pictaria", icon: Star },
  { to: "/portal/daily-past", label: "Yesterdailys", icon: History },
  { to: "/portal/subscribers", label: "Subscribers", icon: Users },
  { to: "/portal/community", label: "To Be Authorized", icon: ShieldCheck },
  { to: "/portal/push", label: "Notifications", icon: Bell },
  { to: "/portal/beta", label: "Beta Codes", icon: Ticket },
  { to: "/portal/new", label: "New Business", icon: Building2 },
] as const;

/**
 * Shared shell for every /portal/* page: a collapsible sidebar for
 * navigation and a light, neutral content area — deliberately distinct from
 * the tropical public site so it reads as a real admin panel.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            to="/portal/dashboard"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent"
          >
            <img
              src={turtleMascot}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full border border-sidebar-border object-cover"
            />
            <span className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-display text-base text-sidebar-foreground">Pictaria</span>
              <span className="text-[9px] tracking-[0.18em] text-muted-foreground uppercase">
                Admin
              </span>
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.to || pathname.startsWith(`${item.to}/`)}
                      tooltip={item.label}
                    >
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <div className="flex -space-x-2 group-data-[collapsible=icon]:hidden" aria-hidden>
              <img
                src={sharkMascot}
                alt=""
                className="h-6 w-6 rounded-full border-2 border-sidebar object-cover"
              />
              <img
                src={pandaMascot}
                alt=""
                className="h-6 w-6 rounded-full border-2 border-sidebar object-cover"
              />
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              title="View live site"
              className="inline-flex items-center gap-1 text-[9px] tracking-[0.14em] text-muted-foreground uppercase hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
            >
              Live site
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium text-foreground">Pictaria Admin</span>
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
