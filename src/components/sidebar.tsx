"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileText,
  Layers,
  Map,
  Upload,
  FileCode2,
  FileSearch,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  MapPin,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      title: "Overview",
      href: "/",
      icon: Map,
      variant: "default",
    },
    {
      title: "Map Demo",
      href: "/map-demo",
      icon: MapPin,
      variant: "default",
    },
    {
      title: "General",
      icon: BarChart3,
      variant: "ghost",
      children: [
        {
          title: "Lane Miles",
          href: "/general/lane-miles",
        },
        {
          title: "PMIS Data",
          href: "/general/pmis-data",
        },
        {
          title: "Traffic Data",
          href: "/general/traffic-data",
        },
      ],
    },
    {
      title: "Level 1 Sections",
      href: "/level-1",
      icon: Layers,
      variant: "ghost",
    },
    {
      title: "Special Sections",
      href: "/special-sections",
      icon: FileText,
      variant: "ghost",
    },
    {
      title: "Experimental Sections",
      href: "/experimental-sections",
      icon: FileSearch,
      variant: "ghost",
    },
    {
      title: "Forensic Evaluation",
      href: "/forensic-evaluation",
      icon: FileCode2,
      variant: "ghost",
    },
    {
      title: "Specifications",
      icon: BookOpen,
      variant: "ghost",
      children: [
        {
          title: "Standard Specifications",
          href: "/specifications/standard",
        },
        {
          title: "Manual & Guidelines",
          href: "/specifications/guidelines",
        },
        {
          title: "Roadway Standards",
          href: "/specifications/roadway",
        },
      ],
    },
    {
      title: "Upload Data",
      href: "/upload",
      icon: Upload,
      variant: "ghost",
    },
    {
      title: "Documentation",
      href: "/documentation",
      icon: FileText,
      variant: "ghost",
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="absolute left-4 top-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <MobileSidebar routes={routes} pathname={pathname} setOpen={setOpen} />
        </SheetContent>
      </Sheet>
      <div className={cn("hidden lg:block border-r bg-background h-screen", className)}>
        <div className="h-full py-4 flex flex-col">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">RPDB</h2>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1 py-2">
              {routes.map((route, i) =>
                route.children ? (
                  <ExpandableItem key={i} route={route} pathname={pathname} />
                ) : (
                  <Link
                    key={i}
                    href={route.href || "#"}
                    className={cn(
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
                    )}
                  >
                    <route.icon className="mr-2 h-4 w-4" />
                    <span>{route.title}</span>
                  </Link>
                ),
              )}
            </div>
          </ScrollArea>
          <div className="mt-auto px-3 py-2">
            <div className="px-3 py-2 text-xs text-muted-foreground">© 2025 Texas Tech University</div>
          </div>
        </div>
      </div>
    </>
  )
}

function MobileSidebar({
  routes,
  pathname,
  setOpen,
}: {
  routes: any[]
  pathname: string
  setOpen: (open: boolean) => void
}) {
  return (
    <div className="h-full py-4 flex flex-col">
      <div className="px-3 py-2 flex items-center justify-between border-b mb-1">
        <h2 className="text-lg font-semibold tracking-tight">RPDB</h2>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {routes.map((route, i) =>
            route.children ? (
              <ExpandableItem key={i} route={route} pathname={pathname} onClick={() => setOpen(false)} />
            ) : (
              <Link
                key={i}
                href={route.href || "#"}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
                )}
                onClick={() => setOpen(false)}
              >
                <route.icon className="mr-2 h-4 w-4" />
                <span>{route.title}</span>
              </Link>
            ),
          )}
        </div>
      </ScrollArea>
      <div className="mt-auto px-3 py-2">
        <div className="px-3 py-2 text-xs text-muted-foreground">© 2025 Texas Tech University</div>
      </div>
    </div>
  )
}

function ExpandableItem({
  route,
  pathname,
  onClick,
}: {
  route: any
  pathname: string
  onClick?: () => void
}) {
  const [expanded, setExpanded] = useState(route.children?.some((child: any) => pathname === child.href))

  return (
    <div className="space-y-1">
      <Button variant="ghost" className="w-full justify-between" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center">
          <route.icon className="mr-2 h-4 w-4" />
          <span>{route.title}</span>
        </div>
        <ChevronRight className={cn("h-4 w-4 transition-transform", expanded && "rotate-90")} />
      </Button>
      {expanded && route.children && (
        <div className="pl-6 space-y-1">
          {route.children.map((child: any, i: number) => (
            <Link
              key={i}
              href={child.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === child.href ? "bg-accent text-accent-foreground" : "transparent",
              )}
              onClick={onClick}
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
