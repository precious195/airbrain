// src/types/database.ts

/**
 * TypeScript interfaces for Firebase Realtime Database schema
 */

export interface User {
    id: string;
    email: string;
    phone: string;
    role: 'admin' | 'agent' | 'customer';
    industryId?: string; // Legacy/Global admin
    companyId?: string; // Multi-tenant support
    createdAt: number;
    displayName: string;
    metadata?: Record<string, any>;
}

export interface Customer {
    id: string;
    phone: string;
    email?: string;
    name: string;
    industryId: IndustryType;
    verified: boolean;
    verificationMethod: 'otp' | 'kyc';
    metadata?: Record<string, any>;
    createdAt: number;
    lastActivity?: number;
}

export type IndustryType = 'mobile' | 'banking' | 'microfinance' | 'insurance' | 'television';

export type ChannelType = 'whatsapp' | 'sms' | 'web' | 'voice' | 'email';

export type MessageSender = 'customer' | 'ai' | 'agent';

export interface Message {
    id: string;
    sender: MessageSender;
    content: string;
    intent?: string;
    confidence?: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface ConversationContext {
    intent?: string;
    industry: IndustryType;
    customData?: Record<string, any>;
    accountInfo?: Record<string, any>;
}

export interface Conversation {
    id: string;
    customerId: string;
    channel: ChannelType;
    status: 'active' | 'resolved' | 'escalated';
    startedAt: number;
    endedAt?: number;
    lastMessageAt: number;
    context: ConversationContext;
    messages: Record<string, Message>;
    assignedAgent?: string;
}

export type TicketCategory = 'billing' | 'technical' | 'complaint' | 'inquiry' | 'other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Ticket {
    id: string;
    conversationId: string;
    customerId: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTo?: string;
    createdAt: number;
    resolvedAt?: number;
    notes?: Record<string, TicketNote>;
    tags?: string[];
    slaDeadline?: number;
}

export interface TicketNote {
    id: string;
    agentId: string;
    agentName: string;
    note: string;
    timestamp: number;
    internal?: boolean;
}

export interface KnowledgeArticle {
    id: string;
    industryId: IndustryType;
    title: string;
    content: string;
    tags: string[];
    embeddingId?: string;
    createdAt: number;
    updatedAt: number;
    author: string;
    published: boolean;
}

// Industry-specific interfaces

export interface MobileAccount {
    customerId: string;
    phoneNumber: string;
    operator: 'airtel' | 'mtn' | 'zamtel';
    balance: number;
    dataBalance?: number;
    lastUpdated: number;
}

export interface BankAccount {
    customerId: string;
    accountNumber: string;
    accountType: 'savings' | 'checking' | 'loan';
    balance: number;
    currency: string;
    lastUpdated: number;
}

export interface Loan {
    id: string;
    customerId: string;
    amount: number;
    status: 'active' | 'paid' | 'defaulted' | 'pending';
    dueDate: number;
    riskScore: number;
    interestRate: number;
    remainingBalance: number;
}

export interface InsurancePolicy {
    id: string;
    customerId: string;
    policyNumber: string;
    policyType: 'life' | 'health' | 'auto' | 'property';
    premium: number;
    coverageAmount: number;
    status: 'active' | 'expired' | 'cancelled';
    renewalDate: number;
}

export interface TVSubscription {
    customerId: string;
    decoderNumber: string;
    package: 'basic' | 'standard' | 'premium';
    status: 'active' | 'suspended' | 'cancelled';
    expiryDate: number;
    autoRenewal: boolean;
}

// Analytics interfaces

export type MetricType = 'csat' | 'resolution_time' | 'ai_accuracy' | 'escalation_rate' | 'ticket_volume';

export interface Metric {
    id: string;
    type: MetricType;
    value: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface FraudAlert {
    id: string;
    customerId: string;
    alertType: 'multiple_loans' | 'suspicious_claim' | 'identity_mismatch' | 'unusual_activity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'investigating' | 'resolved' | 'false_positive';
    createdAt: number;
    resolvedAt?: number;
    notes?: string;
}

export interface AuditLog {
    id: string;
    userId: string;
    action: 'create' | 'update' | 'delete' | 'access';
    resource: string;
    resourceId: string;
    timestamp: number;
    ipAddress?: string;
    metadata?: Record<string, any>;
}

// Knowledge Base Interfaces

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    active: boolean;
    lastUpdated: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    specifications: Record<string, string>;
    features: string[];
    active: boolean;
    lastUpdated: number;
}

export interface Procedure {
    id: string;
    title: string;
    steps: string[];
    requirements: string[];
    category: 'registration' | 'support' | 'other';
    active: boolean;
    lastUpdated: number;
}

export interface IndustryKnowledge {
    faqs: Record<string, FAQ>;
    products: Record<string, Product>;
    procedures: Record<string, Procedure>;
}

export interface AutomationStep {
    type: 'navigate' | 'click' | 'type' | 'wait' | 'extract' | 'screenshot';
    selector?: string;
    value?: string;
    timeout?: number;
    extractAs?: string; // variable name to store extracted data
}

export interface BrowserAutomationConfig {
    enabled: boolean;
    loginUrl: string;
    selectors: {
        usernameField: string;
        passwordField: string;
        loginButton: string;
        balanceElement?: string;
        transactionsTable?: string;
        [key: string]: string | undefined;
    };
    actions: {
        name: string;
        description: string;
        steps: AutomationStep[];
        enabled: boolean;
    }[];
    sessionTimeout?: number; // minutes
    headless?: boolean;
}

export interface SystemIntegration {
    enabled: boolean;
    integrationType: 'api' | 'browser' | 'hybrid';

    // API Integration fields
    systemUrl: string;
    username: string;
    password: string; // Encrypted in storage
    authType: 'basic' | 'bearer' | 'apiKey';
    apiKey?: string;
    rules: {
        // Define what operations the AI can perform
        canViewBalance: boolean;
        canViewTransactions: boolean;
        canViewCustomerInfo: boolean;
        canUpdateRecords: boolean;
        canProcessPayments: boolean;
        canCreateTickets: boolean;
        customOperations?: {
            name: string;
            endpoint: string;
            method: 'GET' | 'POST' | 'PUT' | 'DELETE';
            description: string;
            enabled: boolean;
        }[];
    };
    headers?: Record<string, string>;
    rateLimits?: {
        requestsPerMinute: number;
        requestsPerDay: number;
    };
    timeout?: number; // milliseconds
    lastTested?: number;
    status?: 'active' | 'inactive' | 'error';

    // Browser Automation fields
    browserAutomation?: BrowserAutomationConfig;
}

export interface Company {
    id: string;
    name: string;
    industry: IndustryType;
    whatsappConfig?: WhatsAppIndustryConfig;
    systemIntegration?: SystemIntegration;
    createdAt: number;
    settings?: Record<string, any>;
}

export interface WhatsAppIndustryConfig {
    enabled: boolean;
    phoneNumberId: string;
    accessToken: string;
    businessAccountId: string;
    webhookVerifyToken: string;
    autoResponse: boolean;
    escalationThreshold: number;
    businessHours: {
        enabled: boolean;
        timezone: string;
        schedule: Record<string, { start: string; end: string }>;
    };
    welcomeMessage: string;
    offlineMessage: string;
}
