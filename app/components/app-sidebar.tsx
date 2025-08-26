"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Vote,
  Plus,
  Settings,
  HelpCircle,
  Search,
  Database,
  FileText,
  Users,
  Home,
  Eye,
  Folder,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth/AuthProvider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const pathname = usePathname()

  const data = {
    user: user ? {
      name: user.name,
      email: user.email,
      avatar: "/avatars/user.jpg",
    } : {
      name: "Gość",
      email: "Niezalogowany",
      avatar: "/avatars/guest.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Głosowania",
        url: "/vote/manage",
        icon: Vote,
      },
      {
        title: "Uchwały",
        url: "/resolution",
        icon: FileText,
      },
      {
        title: "Budżet",
        url: "/budget",
        icon: BarChart3,
      },
    ],
    navSecondary: [
      {
        title: "Ustawienia",
        url: "/settings",
        icon: Settings,
      },
      {
        title: "Pomoc",
        url: "/help",
        icon: HelpCircle,
      },
      {
        title: "Wyszukaj",
        url: "/search",
        icon: Search,
      },
    ],
    documents: [
      {
        name: "Dokumenty",
        url: "/docs",
        icon: Folder,
      },
      {
        name: "Raporty",
        url: "/docs/raport",
        icon: FileText,
      },
      {
        name: "Użytkownicy",
        url: "/users",
        icon: Users,
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <Vote className="!size-5" />
                <span className="text-base font-semibold">ZSS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
