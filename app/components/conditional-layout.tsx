"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Lista stron bez sidebar
  const pagesWithoutSidebar = [
    "/login",
    "/register", 
    "/", // strona główna
  ]
  
  // Sprawdź czy aktualna ścieżka powinna mieć sidebar
  const shouldShowSidebar = !pagesWithoutSidebar.some(path => {
    return pathname === path
  }) && !pathname.match(/^\/vote\/[^/]+$/) || pathname === "/vote/manage" || pathname === "/vote/new" // Pokaż sidebar dla zarządzania głosowaniami, ukryj tylko dla stron głosowania (np. /vote/abc123)

  if (!shouldShowSidebar) {
    // Bez sidebar - pełny layout dla stron publicznych
    return <main className="min-h-screen">{children}</main>
  }

  // Z sidebar - layout z panelem bocznym dla panelu admin
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <span className="text-sm text-muted-foreground">ZSS - system zarządzania</span>
          </div>
        </header>
        <main className="flex-1 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}