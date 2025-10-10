"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/ui/primitives/input";
import { HeaderUserDropdown } from "@/ui/components/header/header-user";
import { NotificationsWidget } from "@/ui/components/notifications/notifications-widget";
import { AdminSidebar } from "./admin-sidebar";
import type { AdminUserWithDetails } from "@/db/schema";

interface AdminHeaderProps {
  adminUser: AdminUserWithDetails;
}

export function AdminHeader({ adminUser }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        {/* Mobile Menu Button - Hidden on desktop */}
        <div className="lg:hidden">
          <AdminSidebar adminUser={adminUser} />
        </div>

        {/* Search - Responsive */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Right side - Responsive */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <NotificationsWidget />

          {/* User menu */}
          <HeaderUserDropdown
            isDashboard={true}
            userEmail={adminUser.user.email}
            userImage={adminUser.user.image}
            userName={adminUser.user?.name || 'Admin User'}
            adminRole={adminUser.role?.name}
          />
        </div>
      </div>
    </header>
  );
}
