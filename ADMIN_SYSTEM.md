# Med-Touch Pharmacy Admin System

## Overview

The Med-Touch Pharmacy admin system provides comprehensive management capabilities for pharmacy operations, including product management, inventory tracking, order processing, and user administration.

## Features

### 🔐 Admin Authentication & Authorization
- **Role-based access control** with three permission levels:
  - **Super Admin**: Full system access
  - **Admin**: Most permissions except admin management
  - **Manager**: Limited permissions for day-to-day operations
- **Secure route protection** with middleware
- **Session management** integrated with Better Auth

### 📊 Dashboard Overview
- **Real-time statistics** and key metrics
- **Low stock alerts** and inventory warnings
- **Recent activity** and order summaries
- **Quick access** to all management functions

### 🏷️ Category Management
- **Create, edit, and delete** product categories
- **Image management** with fallback support
- **Sort ordering** and active/inactive status
- **SEO-friendly** slugs and descriptions

### 📦 Product Management
- **Comprehensive product details** including:
  - Basic info (name, description, SKU, barcode)
  - Pricing (current price, original price)
  - Images (multiple image support)
  - Physical attributes (weight, dimensions)
  - Manufacturer and batch information
  - Prescription requirements
  - SEO metadata
- **Category assignment** and organization
- **Featured product** designation
- **Bulk operations** and filtering

### 📈 Inventory Management
- **Real-time stock tracking** with:
  - Current stock levels
  - Reserved quantities
  - Available quantities
  - Low stock thresholds
  - Reorder points and quantities
- **Stock adjustments** with transaction history
- **Multiple adjustment types**:
  - Stock in (purchases, returns)
  - Stock out (sales, damage)
  - Manual adjustments
- **Automated alerts** for low stock and reorder points
- **Transaction logging** with audit trail

### 👥 Admin User Management
- **Add/remove admin users** by email
- **Role assignment** and permission management
- **User activity tracking**
- **Account activation/deactivation**

### 📋 Order Management
- **Order status tracking** (pending, processing, shipped, completed, cancelled)
- **Customer information** and order details
- **Status updates** and workflow management
- **Order history** and reporting

## Database Schema

### Core Tables

#### Admin System
- `admin_role`: Defines permission levels and access rights
- `admin_user`: Links users to admin roles and tracks creation

#### Product Management
- `category`: Product categories with metadata
- `product`: Complete product information
- `product_variant`: Product variations (sizes, colors, etc.)

#### Inventory Management
- `inventory`: Current stock levels and thresholds
- `inventory_transaction`: Complete audit trail of stock movements

## API Endpoints

### Categories
- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create new category
- `GET /api/admin/categories/[id]` - Get category details
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

### Products
- `GET /api/admin/products` - List products with filtering
- `POST /api/admin/products` - Create new product
- `GET /api/admin/products/[id]` - Get product details
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

### Inventory
- `GET /api/admin/inventory` - Get inventory overview
- `POST /api/admin/inventory/adjustment` - Make stock adjustment

## Getting Started

### 1. Initial Setup
The admin system is automatically initialized when you run the application. Default roles are created and the first user is made a Super Admin.

### 2. Accessing the Admin Panel
1. Sign in with your user account
2. Navigate to `/admin`
3. You'll see the admin dashboard with your assigned permissions

### 3. Creating Additional Admins
1. Go to **Admin Users** in the sidebar
2. Click **Add Admin**
3. Enter the user's email address
4. Select their role and permissions
5. The user will have admin access on their next login

## Permissions Matrix

| Permission | Super Admin | Admin | Manager |
|------------|-------------|-------|---------|
| Manage Products | ✅ | ✅ | ✅ |
| Manage Categories | ✅ | ✅ | ❌ |
| Manage Inventory | ✅ | ✅ | ✅ |
| Manage Admins | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |
| Manage Orders | ✅ | ✅ | ✅ |
| Manage Customers | ✅ | ✅ | ❌ |
| Manage Settings | ✅ | ❌ | ❌ |

## Security Features

- **Route Protection**: All admin routes are protected by middleware
- **Permission Checks**: Each action is validated against user permissions
- **Audit Trail**: All inventory changes are logged with user attribution
- **Session Management**: Secure session handling with Better Auth
- **CSRF Protection**: Built-in protection against cross-site attacks

## Customization

### Adding New Permissions
1. Update the `AdminPermissions` interface in `src/db/schema/admin/types.ts`
2. Add the permission to the role definitions in `src/lib/admin-auth.ts`
3. Update the permission checks in your components
4. Add the permission to the navigation items in `src/ui/components/admin/admin-sidebar.tsx`

### Adding New Admin Roles
1. Create the role in the database
2. Define permissions in `ADMIN_PERMISSIONS` object
3. Update the role selection in admin user management

## Troubleshooting

### Common Issues

1. **"Admin access required" error**
   - Ensure the user has an admin role assigned
   - Check that the admin user is active
   - Verify the user is properly authenticated

2. **Permission denied errors**
   - Check the user's role and permissions
   - Ensure the action is allowed for their role level
   - Verify the permission is correctly defined

3. **Database connection issues**
   - Ensure the database is running
   - Check the `DATABASE_URL` environment variable
   - Verify the admin tables exist (run migrations)

### Support
For technical support or feature requests, please contact the development team.

---

**Note**: This admin system is designed specifically for pharmacy operations and includes features like prescription management, inventory tracking, and pharmaceutical product categorization.
