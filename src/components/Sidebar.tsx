import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  History,
  Settings,
  DollarSign,
} from "lucide-react"

interface SidebarProps {
  role: 'mentee' | 'mentor';
  isOpen: boolean;
  onClose: () => void;
}

const sidebarLinks = {
  mentee: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mentors", label: "Find Mentors", icon: Users },
    { href: "/credits", label: "Credits", icon: CreditCard },
  ],
  mentor: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/requests", label: "Feedback Requests", icon: Users },
    { href: "/earnings", label: "Earnings", icon: DollarSign },
    { href: "/feedback-history", label: "Feedback History", icon: History },
  ],
  common: [
    { href: "/settings", label: "Settings", icon: Settings },
  ]
};

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const links = [...sidebarLinks[role], ...sidebarLinks.common];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="mt-14 p-6">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-primary">μ</span>
          <span className="ml-2 text-xl font-semibold">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} to={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  location.pathname === link.href && "bg-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-background">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
} 