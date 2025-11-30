// src/lib/admin/access-control.ts

/**
 * Admin module - User access control and permissions
 */

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'viewer' | 'translator';

export type Permission =
    | 'dashboard.view'
    | 'dashboard.export'
    | 'conversations.view'
    | 'conversations.assign'
    | 'conversations.close'
    | 'responses.view'
    | 'responses.create'
    | 'responses.edit'
    | 'responses.delete'
    | 'escalation.view'
    | 'escalation.create'
    | 'escalation.edit'
    | 'escalation.delete'
    | 'translations.view'
    | 'translations.edit'
    | 'payments.view'
    | 'payments.configure'
    | 'payments.process'
    | 'users.view'
    | 'users.create'
    | 'users.edit'
    | 'users.delete'
    | 'analytics.view'
    | 'analytics.export'
    | 'settings.view'
    | 'settings.edit';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    industries: string[]; // Industries this user can access
    permissions: Permission[];
    active: boolean;
    lastLogin?: string;
    createdAt: string;
    createdBy: string;
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: Record<string, { before: any; after: any }>;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    status: 'success' | 'failed';
    errorMessage?: string;
}

/**
 * Role permission mappings
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    super_admin: [
        'dashboard.view',
        'dashboard.export',
        'conversations.view',
        'conversations.assign',
        'conversations.close',
        'responses.view',
        'responses.create',
        'responses.edit',
        'responses.delete',
        'escalation.view',
        'escalation.create',
        'escalation.edit',
        'escalation.delete',
        'translations.view',
        'translations.edit',
        'payments.view',
        'payments.configure',
        'payments.process',
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'analytics.view',
        'analytics.export',
        'settings.view',
        'settings.edit',
    ],
    admin: [
        'dashboard.view',
        'dashboard.export',
        'conversations.view',
        'conversations.assign',
        'conversations.close',
        'responses.view',
        'responses.create',
        'responses.edit',
        'escalation.view',
        'escalation.create',
        'escalation.edit',
        'translations.view',
        'translations.edit',
        'payments.view',
        'payments.process',
        'users.view',
        'users.create',
        'users.edit',
        'analytics.view',
        'analytics.export',
        'settings.view',
    ],
    manager: [
        'dashboard.view',
        'conversations.view',
        'conversations.assign',
        'conversations.close',
        'responses.view',
        'responses.create',
        'escalation.view',
        'translations.view',
        'payments.view',
        'analytics.view',
    ],
    agent: [
        'dashboard.view',
        'conversations.view',
        'conversations.close',
        'responses.view',
    ],
    viewer: [
        'dashboard.view',
        'conversations.view',
        'analytics.view',
    ],
    translator: [
        'translations.view',
        'translations.edit',
    ],
};

/**
 * Get all users
 */
export async function getUsers(role?: UserRole): Promise<User[]> {
    // TODO: Query from Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    const allUsers: User[] = [
        {
            id: 'USR001',
            email: 'admin@company.com',
            name: 'System Administrator',
            role: 'super_admin',
            industries: ['all'],
            permissions: ROLE_PERMISSIONS.super_admin,
            active: true,
            lastLogin: new Date(Date.now() - 3600000).toISOString(),
            createdAt: '2024-01-01',
            createdBy: 'system',
        },
        {
            id: 'USR002',
            email: 'manager@company.com',
            name: 'John Manager',
            role: 'manager',
            industries: ['banking', 'microfinance'],
            permissions: ROLE_PERMISSIONS.manager,
            active: true,
            lastLogin: new Date(Date.now() - 7200000).toISOString(),
            createdAt: '2024-02-15',
            createdBy: 'USR001',
        },
        {
            id: 'USR003',
            email: 'agent1@company.com',
            name: 'Sarah Agent',
            role: 'agent',
            industries: ['banking'],
            permissions: ROLE_PERMISSIONS.agent,
            active: true,
            lastLogin: new Date(Date.now() - 1800000).toISOString(),
            createdAt: '2024-03-10',
            createdBy: 'USR002',
        },
        {
            id: 'USR004',
            email: 'translator@company.com',
            name: 'Maria Translator',
            role: 'translator',
            industries: ['all'],
            permissions: ROLE_PERMISSIONS.translator,
            active: true,
            lastLogin: new Date(Date.now() - 86400000).toISOString(),
            createdAt: '2024-04-05',
            createdBy: 'USR001',
        },
    ];

    return role ? allUsers.filter(u => u.role === role) : allUsers;
}

/**
 * Create user
 */
export async function createUser(
    user: Omit<User, 'id' | 'createdAt' | 'permissions'>,
    createdBy: string
): Promise<{ success: boolean; message: string; userId?: string }> {
    // TODO: Save to Firebase and send invitation email

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        return {
            success: false,
            message: 'Invalid email address',
        };
    }

    const userId = `USR${Date.now()}`;

    // TODO: Send invitation email with temporary password

    return {
        success: true,
        message: `User ${user.email} created successfully. Invitation sent.`,
        userId,
    };
}

/**
 * Update user
 */
export async function updateUser(
    userId: string,
    updates: Partial<User>,
    updatedBy: string
): Promise<{ success: boolean; message: string }> {
    // TODO: Update in Firebase and log audit

    await new Promise((resolve) => setTimeout(resolve, 500));

    // If role is being changed, update permissions
    if (updates.role) {
        updates.permissions = ROLE_PERMISSIONS[updates.role];
    }

    // Log the update
    await logAuditEvent({
        userId: updatedBy,
        userName: 'Admin',
        action: 'update_user',
        resource: 'user',
        resourceId: userId,
        changes: updates as any,
        ipAddress: '0.0.0.0',
        userAgent: 'System',
        timestamp: new Date().toISOString(),
        status: 'success',
    });

    return {
        success: true,
        message: `User ${userId} updated successfully`,
    };
}

/**
 * Delete user
 */
export async function deleteUser(
    userId: string,
    deletedBy: string
): Promise<{ success: boolean; message: string }> {
    // TODO: Soft delete in Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Log the deletion
    await logAuditEvent({
        userId: deletedBy,
        userName: 'Admin',
        action: 'delete_user',
        resource: 'user',
        resourceId: userId,
        ipAddress: '0.0.0.0',
        userAgent: 'System',
        timestamp: new Date().toISOString(),
        status: 'success',
    });

    return {
        success: true,
        message: `User ${userId} deleted successfully`,
    };
}

/**
 * Check if user has permission
 */
export function hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission);
}

/**
 * Check if user can access industry
 */
export function canAccessIndustry(user: User, industry: string): boolean {
    return user.industries.includes('all') || user.industries.includes(industry);
}

/**
 * Log audit event
 */
export async function logAuditEvent(log: Omit<AuditLog, 'id'>): Promise<void> {
    // TODO: Save to Firebase

    console.log('Audit log:', log);
}

/**
 * Get audit logs
 */
export async function getAuditLogs(
    filters?: {
        userId?: string;
        action?: string;
        resource?: string;
        dateFrom?: string;
        dateTo?: string;
    }
): Promise<AuditLog[]> {
    // TODO: Query from Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
        {
            id: 'AUDIT001',
            userId: 'USR001',
            userName: 'System Administrator',
            action: 'create_escalation_rule',
            resource: 'escalation_rule',
            resourceId: 'ESC001',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'success',
        },
        {
            id: 'AUDIT002',
            userId: 'USR002',
            userName: 'John Manager',
            action: 'update_response',
            resource: 'custom_response',
            resourceId: 'RESP001',
            changes: {
                priority: { before: 5, after: 10 },
            },
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0...',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            status: 'success',
        },
    ];
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: string): Promise<{
    totalActions: number;
    lastAction: string;
    topActions: Array<{ action: string; count: number }>;
    loginHistory: Array<{ timestamp: string; ipAddress: string }>;
}> {
    // TODO: Query from Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        totalActions: 345,
        lastAction: new Date(Date.now() - 3600000).toISOString(),
        topActions: [
            { action: 'view_dashboard', count: 123 },
            { action: 'update_response', count: 67 },
            { action: 'assign_conversation', count: 45 },
        ],
        loginHistory: [
            { timestamp: new Date(Date.now() - 3600000).toISOString(), ipAddress: '192.168.1.100' },
            { timestamp: new Date(Date.now() - 90000000).toISOString(), ipAddress: '192.168.1.100' },
        ],
    };
}
