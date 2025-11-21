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
import { X402PaywallProvider } from "@/hooks/use-x402-paywall"
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
  Percent,
  Coins,
  BookOpen,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documentation", href: "/dashboard/docs", icon: BookOpen },
  { name: "Plans", href: "/dashboard/plans", icon: CreditCard },
  { name: "Coupons", href: "/dashboard/coupons", icon: Percent },
  { name: "Subscribers", href: "/dashboard/subscribers", icon: Users },
  { name: "Payments", href: "/dashboard/payments", icon: Receipt },
  { name: "Micropayments", href: "/dashboard/micropayments", icon: Coins },
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

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <X402PaywallProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile sidebar */}
        <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-white/10 p-6 backdrop-blur-xl">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/assets/subchain-glyph.svg" alt="SubChain mark" width={32} height={32} />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">SubChain</span>
              </Link>
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
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    pathname === item.href
                      ? "bg-white/10 text-white shadow-[0_10px_30px_-20px_rgba(99,102,241,0.8)]"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
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
          <div className="flex min-h-0 flex-1 flex-col border-r border-white/10 bg-card/90 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b border-white/10 px-6">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/assets/subchain-glyph.svg" alt="SubChain mark" width={32} height={32} />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">SubChain</span>
              </Link>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    pathname === item.href
                      ? "bg-white/10 text-white shadow-[0_14px_40px_-24px_rgba(14,165,233,0.6)]"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
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
    </X402PaywallProvider>
  )
}
