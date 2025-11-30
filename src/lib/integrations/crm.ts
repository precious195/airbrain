// src/lib/integrations/crm.ts

/**
 * Integration Layer - CRM Systems
 * Supports Salesforce, HubSpot, Zoho, and custom CRMs
 */

export interface CRMConfig {
    provider: 'salesforce' | 'hubspot' | 'zoho' | 'custom';
    apiUrl: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    tier?: 'regular' | 'vip' | 'premium';
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    lastContactDate?: string;
    customFields?: Record<string, any>;
}

export interface Contact {
    id: string;
    type: 'call' | 'email' | 'chat' | 'whatsapp' | 'sms';
    subject: string;
    description: string;
    timestamp: string;
    agent?: string;
    duration?: number; // seconds
    outcome?: string;
    notes?: string;
}

export interface Ticket {
    id: string;
    customerId: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    category: string;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

/**
 * CRM Client base class
 */
export abstract class CRMClient {
    protected config: CRMConfig;

    constructor(config: CRMConfig) {
        this.config = config;
    }

    abstract getCustomer(customerId: string): Promise<Customer>;
    abstract createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer>;
    abstract updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer>;
    abstract logContact(customerId: string, contact: Omit<Contact, 'id'>): Promise<Contact>;
    abstract createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket>;
    abstract getCustomerTickets(customerId: string): Promise<Ticket[]>;
    abstract updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket>;
}

/**
 * Salesforce CRM Integration
 */
export class SalesforceCRMClient extends CRMClient {
    private instanceUrl?: string;

    async authenticate(): Promise<void> {
        // TODO: Implement OAuth 2.0 authentication
        try {
            const response = await fetch(`${this.config.apiUrl}/services/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.config.clientId || '',
                    client_secret: this.config.clientSecret || '',
                }),
            });

            const data = await response.json();
            this.config.accessToken = data.access_token;
            this.instanceUrl = data.instance_url;
        } catch (error) {
            throw new Error(`Salesforce authentication failed: ${error}`);
        }
    }

    async getCustomer(customerId: string): Promise<Customer> {
        if (!this.config.accessToken) await this.authenticate();

        const response = await fetch(
            `${this.instanceUrl}/services/data/v58.0/sobjects/Contact/${customerId}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        return {
            id: data.Id,
            firstName: data.FirstName,
            lastName: data.LastName,
            email: data.Email,
            phone: data.Phone,
            tier: data.Customer_Tier__c,
            status: data.Status__c || 'active',
            createdAt: data.CreatedDate,
            lastContactDate: data.LastActivityDate,
            customFields: data,
        };
    }

    async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
        if (!this.config.accessToken) await this.authenticate();

        const response = await fetch(
            `${this.instanceUrl}/services/data/v58.0/sobjects/Contact`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    FirstName: customer.firstName,
                    LastName: customer.lastName,
                    Email: customer.email,
                    Phone: customer.phone,
                    Customer_Tier__c: customer.tier,
                }),
            }
        );

        const data = await response.json();

        return {
            ...customer,
            id: data.id,
            createdAt: new Date().toISOString(),
        };
    }

    async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
        if (!this.config.accessToken) await this.authenticate();

        await fetch(
            `${this.instanceUrl}/services/data/v58.0/sobjects/Contact/${customerId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    FirstName: updates.firstName,
                    LastName: updates.lastName,
                    Email: updates.email,
                    Phone: updates.phone,
                }),
            }
        );

        return this.getCustomer(customerId);
    }

    async logContact(customerId: string, contact: Omit<Contact, 'id'>): Promise<Contact> {
        if (!this.config.accessToken) await this.authenticate();

        const response = await fetch(
            `${this.instanceUrl}/services/data/v58.0/sobjects/Task`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    WhoId: customerId,
                    Subject: contact.subject,
                    Description: contact.description,
                    Type: contact.type,
                    ActivityDate: contact.timestamp,
                }),
            }
        );

        const data = await response.json();

        return {
            ...contact,
            id: data.id,
        };
    }

    async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
        if (!this.config.accessToken) await this.authenticate();

        const response = await fetch(
            `${this.instanceUrl}/services/data/v58.0/sobjects/Case`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ContactId: ticket.customerId,
                    Subject: ticket.subject,
                    Description: ticket.description,
                    Priority: ticket.priority,
                    Status: ticket.status,
                    Type: ticket.category,
                    OwnerId: ticket.assignedTo,
                }),
            }
        );

        const data = await response.json();

        return {
            ...ticket,
            id: data.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    async getCustomerTickets(customerId: string): Promise<Ticket[]> {
        if (!this.config.accessToken) await this.authenticate();

        const response = await fetch(
            `${this.instanceUrl}/services/data/v58.0/query?q=SELECT+Id,Subject,Description,Priority,Status,Type,CreatedDate+FROM+Case+WHERE+ContactId='${customerId}'`,
            {
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                },
            }
        );

        const data = await response.json();

        return data.records.map((record: any) => ({
            id: record.Id,
            customerId,
            subject: record.Subject,
            description: record.Description,
            priority: record.Priority?.toLowerCase() || 'medium',
            status: record.Status?.toLowerCase() || 'open',
            category: record.Type,
            createdAt: record.CreatedDate,
            updatedAt: record.LastModifiedDate,
        }));
    }

    async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
        if (!this.config.accessToken) await this.authenticate();

        await fetch(
            `${this.instanceUrl}/services/data/v58.0/sobjects/Case/${ticketId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Status: updates.status,
                    Priority: updates.priority,
                    OwnerId: updates.assignedTo,
                }),
            }
        );

        // Fetch updated ticket
        const response = await fetch(
            `${this.instanceUrl}/services/data/v58.0/sobjects/Case/${ticketId}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                },
            }
        );

        const data = await response.json();

        return {
            id: data.Id,
            customerId: data.ContactId,
            subject: data.Subject,
            description: data.Description,
            priority: data.Priority?.toLowerCase() || 'medium',
            status: data.Status?.toLowerCase() || 'open',
            category: data.Type,
            createdAt: data.CreatedDate,
            updatedAt: data.LastModifiedDate,
        };
    }
}

/**
 * Custom CRM Integration (Generic REST API)
 */
export class CustomCRMClient extends CRMClient {
    async getCustomer(customerId: string): Promise<Customer> {
        const response = await fetch(
            `${this.config.apiUrl}/customers/${customerId}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();
        return data;
    }

    async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
        const response = await fetch(`${this.config.apiUrl}/customers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customer),
        });

        const data = await response.json();
        return data;
    }

    async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
        const response = await fetch(
            `${this.config.apiUrl}/customers/${customerId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            }
        );

        const data = await response.json();
        return data;
    }

    async logContact(customerId: string, contact: Omit<Contact, 'id'>): Promise<Contact> {
        const response = await fetch(`${this.config.apiUrl}/contacts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customerId, ...contact }),
        });

        const data = await response.json();
        return data;
    }

    async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
        const response = await fetch(`${this.config.apiUrl}/tickets`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticket),
        });

        const data = await response.json();
        return data;
    }

    async getCustomerTickets(customerId: string): Promise<Ticket[]> {
        const response = await fetch(
            `${this.config.apiUrl}/customers/${customerId}/tickets`,
            {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
            }
        );

        const data = await response.json();
        return data;
    }

    async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
        const response = await fetch(
            `${this.config.apiUrl}/tickets/${ticketId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            }
        );

        const data = await response.json();
        return data;
    }
}

/**
 * CRM Service Factory
 */
export class CRMService {
    static createClient(config: CRMConfig): CRMClient {
        switch (config.provider) {
            case 'salesforce':
                return new SalesforceCRMClient(config);
            case 'custom':
                return new CustomCRMClient(config);
            default:
                throw new Error(`Unsupported CRM provider: ${config.provider}`);
        }
    }
}
