import { ref, get, update as firebaseUpdate } from 'firebase/database';
import { database } from '../firebase/client';

export interface Ticket {
    id: string;
    ticketNumber: string; // Human-readable: MT-827193
    customerId: string;
    customerPhone: string;
    customerName?: string;
    issue: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
    assignedAgent?: string;
    createdAt: number;
    updatedAt: number;
    resolvedAt?: number;
    sla: {
        responseDeadline: number;
        resolutionDeadline: number;
        responded: boolean;
        escalated: boolean;
    };
    updates: TicketUpdate[];
    internalNotes: InternalNote[];
}

export interface TicketUpdate {
    id: string;
    timestamp: number;
    author: 'customer' | 'agent' | 'system';
    message: string;
    isPublic: boolean; // Customer can see it
}

export interface InternalNote {
    id: string;
    timestamp: number;
    author: string; // Agent name
    note: string;
}

/**
 * Ticket management service with SLA tracking
 */
export class TicketService {
    private companyId: string;

    constructor(companyId: string) {
        this.companyId = companyId;
    }

    /**
     * Generate human-readable ticket number
     */
    private generateTicketNumber(industry: string): string {
        const prefix = industry.substring(0, 2).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}${random}`;
    }

    /**
     * Calculate SLA deadlines based on priority
     */
    private calculateSLA(priority: Ticket['priority']): { responseDeadline: number; resolutionDeadline: number } {
        const now = Date.now();
        const slaConfig = {
            urgent: { response: 15 * 60 * 1000, resolution: 4 * 60 * 60 * 1000 }, // 15min, 4h
            high: { response: 60 * 60 * 1000, resolution: 24 * 60 * 60 * 1000 }, // 1h, 24h
            medium: { response: 4 * 60 * 60 * 1000, resolution: 48 * 60 * 60 * 1000 }, // 4h, 48h
            low: { response: 24 * 60 * 60 * 1000, resolution: 72 * 60 * 60 * 1000 } // 24h, 72h
        };

        const config = slaConfig[priority];
        return {
            responseDeadline: now + config.response,
            resolutionDeadline: now + config.resolution
        };
    }

    /**
     * Create a new ticket
     */
    async createTicket(params: {
        customerId: string;
        customerPhone: string;
        customerName?: string;
        issue: string;
        category: string;
        priority?: Ticket['priority'];
        industry: string;
    }): Promise<Ticket> {
        const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const ticketNumber = this.generateTicketNumber(params.industry);
        const priority = params.priority || 'medium';
        const sla = this.calculateSLA(priority);

        const ticket: Ticket = {
            id: ticketId,
            ticketNumber,
            customerId: params.customerId,
            customerPhone: params.customerPhone,
            customerName: params.customerName,
            issue: params.issue,
            category: params.category,
            priority,
            status: 'open',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            sla: {
                ...sla,
                responded: false,
                escalated: false
            },
            updates: [{
                id: 'update_1',
                timestamp: Date.now(),
                author: 'system',
                message: `Ticket created: ${params.issue}`,
                isPublic: true
            }],
            internalNotes: []
        };

        const ticketRef = ref(database, `companies/${this.companyId}/tickets/${ticketId}`);
        await firebaseUpdate(ticketRef, ticket);

        return ticket;
    }

    /**
     * Get ticket by ticket number (e.g., "MT-827193")
     */
    async getTicketByNumber(ticketNumber: string): Promise<Ticket | null> {
        const ticketsRef = ref(database, `companies/${this.companyId}/tickets`);
        const snapshot = await get(ticketsRef);

        if (!snapshot.exists()) {
            return null;
        }

        const tickets = snapshot.val();
        const ticket = Object.values(tickets).find(
            (t: any) => t.ticketNumber === ticketNumber
        );

        return ticket as Ticket || null;
    }

    /**
     * Get ticket by ID
     */
    async getTicket(ticketId: string): Promise<Ticket | null> {
        const ticketRef = ref(database, `companies/${this.companyId}/tickets/${ticketId}`);
        const snapshot = await get(ticketRef);

        if (!snapshot.exists()) {
            return null;
        }

        return snapshot.val();
    }

    /**
     * Add update to ticket
     */
    async addUpdate(
        ticketId: string,
        author: 'customer' | 'agent' | 'system',
        message: string,
        isPublic: boolean = true
    ): Promise<void> {
        const ticket = await this.getTicket(ticketId);
        if (!ticket) throw new Error('Ticket not found');

        const update: TicketUpdate = {
            id: `update_${Date.now()}`,
            timestamp: Date.now(),
            author,
            message,
            isPublic
        };

        ticket.updates.push(update);
        ticket.updatedAt = Date.now();

        const ticketRef = ref(database, `companies/${this.companyId}/tickets/${ticketId}`);
        await firebaseUpdate(ticketRef, { updates: ticket.updates, updatedAt: ticket.updatedAt });
    }

    /**
     * Add internal note (not visible to customer)
     */
    async addInternalNote(ticketId: string, author: string, note: string): Promise<void> {
        const ticket = await this.getTicket(ticketId);
        if (!ticket) throw new Error('Ticket not found');

        const internalNote: InternalNote = {
            id: `note_${Date.now()}`,
            timestamp: Date.now(),
            author,
            note
        };

        ticket.internalNotes.push(internalNote);
        ticket.updatedAt = Date.now();

        const ticketRef = ref(database, `companies/${this.companyId}/tickets/${ticketId}`);
        await firebaseUpdate(ticketRef, {
            internalNotes: ticket.internalNotes,
            updatedAt: ticket.updatedAt
        });
    }

    /**
     * Update ticket status
     */
    async updateStatus(
        ticketId: string,
        status: Ticket['status'],
        message?: string
    ): Promise<void> {
        const ticket = await this.getTicket(ticketId);
        if (!ticket) throw new Error('Ticket not found');

        const updates: any = {
            status,
            updatedAt: Date.now()
        };

        if (status === 'resolved' || status === 'closed') {
            updates.resolvedAt = Date.now();
        }

        if (message) {
            const update: TicketUpdate = {
                id: `update_${Date.now()}`,
                timestamp: Date.now(),
                author: 'system',
                message,
                isPublic: true
            };
            updates.updates = [...ticket.updates, update];
        }

        const ticketRef = ref(database, `companies/${this.companyId}/tickets/${ticketId}`);
        await firebaseUpdate(ticketRef, updates);
    }

    /**
     * Get formatted status for customer
     */
    async getCustomerFriendlyStatus(ticketId: string): Promise<string> {
        const ticket = await this.getTicket(ticketId);
        if (!ticket) return 'Ticket not found';

        const latestUpdate = ticket.updates.filter(u => u.isPublic).pop();
        const timeElapsed = Math.floor((Date.now() - ticket.createdAt) / 1000 / 60); // minutes

        let statusMessage = `Your ticket ${ticket.ticketNumber} is currently **${ticket.status.replace('_', ' ')}**.\n\n`;

        if (latestUpdate) {
            const updateTime = new Date(latestUpdate.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            statusMessage += `**Last update** (${updateTime}):\n${latestUpdate.message}\n\n`;
        }

        // SLA information
        if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
            const timeToResolution = Math.floor((ticket.sla.resolutionDeadline - Date.now()) / 1000 / 60 / 60);
            if (timeToResolution > 0) {
                statusMessage += `**Estimated resolution time**: ${timeToResolution} hours\n\n`;
            } else {
                statusMessage += `**Status**: Overdue - escalating to supervisor\n\n`;
            }
        }

        return statusMessage;
    }

    /**
     * Check if ticket is overdue
     */
    async checkSLA(ticketId: string): Promise<{ overdue: boolean; escalate: boolean }> {
        const ticket = await this.getTicket(ticketId);
        if (!ticket) return { overdue: false, escalate: false };

        const now = Date.now();
        const overdue = now > ticket.sla.resolutionDeadline;
        const escalate = overdue && !ticket.sla.escalated;

        return { overdue, escalate };
    }

    /**
     * Send follow-up to back-office
     */
    async sendBackOfficeFollowUp(
        ticketId: string,
        customerName: string,
        reason: string
    ): Promise<void> {
        await this.addInternalNote(
            ticketId,
            'AI Agent',
            `Automated follow-up: ${reason}\nCustomer ${customerName} is requesting an update.`
        );

        await this.addUpdate(
            ticketId,
            'system',
            'Follow-up sent to technical team',
            false
        );

        // In production, this would trigger notifications to agents
        console.log(`📨 Back-office follow-up sent for ticket ${ticketId}`);
    }
}
