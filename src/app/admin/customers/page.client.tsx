"use client";

import type { ColumnDef, ColumnMeta, Column } from "@tanstack/react-table";
import type React from "react";

import { Hash, Mail, User as UserIcon, Calendar, Shield, CheckCircle, XCircle, Search, Trash2, Users, UserCog, UserCheck } from "lucide-react";
import { useMemo, useState, useCallback } from "react";

import { ADMIN_CONFIG } from "@/app";
import { defineMeta, filterFn } from "@/lib/filters";

import { Button } from "@/ui/primitives/button";
import { DataTable } from "@/ui/primitives/data-table/data-table";
import { DataTableColumnHeader } from "@/ui/primitives/data-table/data-table-column-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/primitives/select";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives/card";

import type { UserWithRole } from "./page.types";

interface CustomersPageClientProps {
  initialData: UserWithRole[];
}

const CustomersPageClient: React.FC<CustomersPageClientProps> = ({ initialData }) => {
  const [users, setUsers] = useState<UserWithRole[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate user statistics
  const userStats = useMemo(() => {
    const managers = users.filter(user => user.adminRole?.name === 'super_admin').length;
    const admins = users.filter(user => user.adminRole?.name === 'admin').length;
    const customers = users.filter(user => !user.adminRole).length;
    
    return { managers, admins, customers, total: users.length };
  }, [users]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Handle role change
  const handleRoleChange = useCallback(async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, adminRole: newRole === 'none' ? null : { name: newRole, description: '' } }
            : user
        ));
      } else {
        const error = await response.json();
        console.error('Failed to update user role:', error);
        alert('Failed to update user role: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role. Please try again.');
    }
  }, []);

  // Handle delete user
  const handleDeleteUser = useCallback(async (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUsers(prev => prev.filter(user => user.id !== userId));
        } else {
          const error = await response.json();
          console.error('Failed to delete user:', error);
          alert('Failed to delete user: ' + (error.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  }, []);

  const columns = useMemo(
    (): ColumnDef<UserWithRole>[] => [
      {
        accessorKey: "id",
        filterFn: filterFn("text"),
        header: ({ column }: { column: Column<UserWithRole, unknown> }) => (
          <DataTableColumnHeader column={column} title="User ID" />
        ),
        meta: defineMeta((row: UserWithRole) => row.id, {
          displayName: "User ID",
          icon: Hash,
          type: "text",
        }) as ColumnMeta<UserWithRole, unknown>,
      },
      {
        accessorKey: "name",
        filterFn: filterFn("text"),
        header: ({ column }: { column: Column<UserWithRole, unknown> }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        meta: defineMeta((row: UserWithRole) => row.name, {
          displayName: "Name",
          icon: UserIcon,
          type: "text",
        }) as ColumnMeta<UserWithRole, unknown>,
      },
      ...(ADMIN_CONFIG.displayEmails
        ? [
            {
              accessorKey: "email",
              filterFn: filterFn("text"),
              header: ({ column }: { column: Column<UserWithRole, unknown> }) => (
                <DataTableColumnHeader column={column} title="Email" />
              ),
              meta: defineMeta((row: UserWithRole) => row.email, {
                displayName: "Email",
                icon: Mail,
                type: "text",
              }) as ColumnMeta<UserWithRole, unknown>,
            },
          ]
        : []),
      {
        accessorKey: "emailVerified",
        header: ({ column }: { column: Column<UserWithRole, unknown> }) => (
          <DataTableColumnHeader column={column} title="Email Verified" />
        ),
        cell: ({ row }) => {
          const isVerified = row.getValue("emailVerified") as boolean;
          return (
            <div className="flex items-center">
              {isVerified ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="ml-2 text-sm">
                {isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          );
        },
        meta: defineMeta((row: UserWithRole) => row.emailVerified, {
          displayName: "Email Verified",
          icon: CheckCircle,
          type: "option",
        }) as ColumnMeta<UserWithRole, unknown>,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }: { column: Column<UserWithRole, unknown> }) => (
          <DataTableColumnHeader column={column} title="Joined" />
        ),
        cell: ({ row }) => {
          const date = row.getValue("createdAt") as Date;
          return (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm">
                {new Date(date).toLocaleDateString()}
              </span>
            </div>
          );
        },
        meta: defineMeta((row: UserWithRole) => row.createdAt, {
          displayName: "Joined Date",
          icon: Calendar,
          type: "date",
        }) as ColumnMeta<UserWithRole, unknown>,
      },
      {
        accessorKey: "adminRole",
        header: ({ column }: { column: Column<UserWithRole, unknown> }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          const currentRole = user.adminRole?.name || 'none';
          
          return (
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Select
                value={currentRole}
                onValueChange={(value) => handleRoleChange(user.id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
        meta: defineMeta((row: UserWithRole) => row.adminRole?.name || 'none', {
          displayName: "Role",
          icon: Shield,
          type: "text",
        }) as ColumnMeta<UserWithRole, unknown>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          const isAdmin = user.adminRole?.name === 'admin' || user.adminRole?.name === 'super_admin';
          
          return (
            <div className="flex items-center space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteUser(user.id)}
                disabled={isAdmin}
                title={isAdmin ? "Cannot delete admin users" : "Delete user"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDeleteUser, handleRoleChange],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} of {userStats.total} users
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.managers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.admins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{userStats.customers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Users Table */}
      <DataTable columns={columns} data={filteredUsers} />
    </div>
  );
};

export default CustomersPageClient;
