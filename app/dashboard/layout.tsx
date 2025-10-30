"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/django-api-client"
import { disconnectWallet } from "@/lib/pera"
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  FileText,
  Receipt,
  ScrollText,
  Plug,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Plans", href: "/dashboard/plans", icon: CreditCard },
  { name: "Subscribers", href: "/dashboard/subscribers", icon: Users },
  { name: "Payments", href: "/dashboard/payments", icon: Receipt },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Legal", href: "/dashboard/legal", icon: ScrollText },
  { name: "Integrations", href: "/dashboard/integrations", icon: Plug },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const token = apiClient.getAccessToken()
    if (!token) {
      window.location.replace("/auth/signin")
      return
    }
    setAuthReady(true)
  }, [])

  const handleSignOut = () => {
    disconnectWallet().finally(() => {
      void apiClient.logout()
    })
  }

  return (
    authReady ? (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r p-6">
          <div className="flex items-center justify-between mb-8">
            <Image src="/subchain-logo.png" alt="SubChain Logo" width={200} height={60} className="h-12 w-auto" />
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-card border-r">
          <div className="flex items-center h-16 px-6 border-b">
            <Image src="/subchain-logo.png" alt="SubChain Logo" width={200} height={60} className="h-12 w-auto" />
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center h-16 px-4 bg-background border-b lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
        </div>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
    ) : (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  )
}
