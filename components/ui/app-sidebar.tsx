import {
  Calendar,
  Inbox,
  Lightbulb,
  LogOut,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/app/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

const items = [
  {
    title: "مهارت‌ها",
    url: "/",
    icon: Lightbulb,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="flex p-1 justify-between">
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex gap-4 items-center">
                      <Avatar className="rounded-full w-7 h-7">
                        <AvatarImage
                          className="rounded-full"
                          src="https://github.com/shadcn.png"
                        />
                        <AvatarFallback className="rounded-full">
                          💀
                        </AvatarFallback>
                      </Avatar>
                      <h1>name</h1>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col items-start gap-2 p-1 *:flex *:gap-2 *:items-center">
                    <Link href="/profile">
                      <UserRound size={16} />
                      <h1>Profile</h1>
                    </Link>
                    <Link href="/auth">
                      <LogOut size={16} />
                      <h1>Logout</h1>
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
                <ModeToggle />
              </div>

              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
