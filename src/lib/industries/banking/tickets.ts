// src/lib/industries/banking/tickets.ts

/**
 * Banking module - Ticket/Issue management
 */

export type BankingIssueType =
    | 'card_issue'
    | 'transaction_dispute'
    | 'account_access'
    | 'loan_inquiry'
    | 'charges_complaint'
    | 'branch_service'
    | 'atm_issue'
    | 'online_banking'
    | 'other';

export interface BankingTicket {
    ticketNumber: string;
    accountNumber: string;
    issueType: BankingIssueType;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdDate: string;
    assignedTo?: string;
    resolution?: string;
    sla: {
        responseTime: string; // e.g., "2 hours"
        resolutionTime: string; // e.g., "24 hours"
    };
}

/**
 * Raise a banking ticket
 */
export async function raiseTicket(
    accountNumber: string,
    issueType: BankingIssueType,
    subject: string,
    description: string
): Promise<{ success: boolean; message: string; ticket?: BankingTicket }> {
    // TODO: Create ticket in banking CRM system

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Determine priority and SLA based on issue type
    let priority: BankingTicket['priority'] = 'medium';
    let sla = {
        responseTime: '4 hours',
        resolutionTime: '48 hours',
    };

    // Critical issues get higher priority
    if (issueType === 'transaction_dispute' || issueType === 'card_issue') {
        priority = 'high';
        sla = {
            responseTime: '2 hours',
            resolutionTime: '24 hours',
        };
    }

    if (issueType === 'account_access') {
        priority = 'urgent';
        sla = {
            responseTime: '1 hour',
            resolutionTime: '4 hours',
        };
    }

    const ticketNumber = `TKT${Date.now()}`;

    const ticket: BankingTicket = {
        ticketNumber,
        accountNumber,
        issueType,
        subject,
        description,
        priority,
        status: 'open',
        createdDate: new Date().toISOString(),
        sla,
    };

    return {
        success: true,
        message: `Ticket created successfully!\n\nTicket Number: ${ticketNumber}\nPriority: ${priority.toUpperCase()}\n\nExpected Response: ${sla.responseTime}\nExpected Resolution: ${sla.resolutionTime}\n\nWe'll contact you shortly to resolve this issue.`,
        ticket,
    };
}

/**
 * Get ticket status
 */
export async function getTicketStatus(ticketNumber: string): Promise<BankingTicket | null> {
    // TODO: Query ticket system

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        ticketNumber,
        accountNumber: 'ACC123456',
        issueType: 'transaction_dispute',
        subject: 'Unauthorized transaction',
        description: 'I did not make a transaction of K500 on Nov 28',
        priority: 'high',
        status: 'in_progress',
        createdDate: '2024-11-28T10:30:00Z',
        assignedTo: 'Support Agent - Mary Johnson',
        sla: {
            responseTime: '2 hours',
            resolutionTime: '24 hours',
        },
    };
}

/**
 * Format ticket details
 */
export function formatTicketDetails(ticket: BankingTicket): string {
    const statusEmoji = {
        open: '🆕',
        in_progress: '⏳',
        resolved: '✅',
        closed: '🔒',
    };

    return `${statusEmoji[ticket.status]} Ticket Details

Ticket #: ${ticket.ticketNumber}
Issue: ${ticket.issueType.replace('_', ' ').toUpperCase()}
Priority: ${ticket.priority.toUpperCase()}

Subject: ${ticket.subject}
Status: ${ticket.status.replace('_', ' ').toUpperCase()}

Created: ${new Date(ticket.createdDate).toLocaleString()}
${ticket.assignedTo ? `Assigned to: ${ticket.assignedTo}` : ''}

SLA:
• Response within ${ticket.sla.responseTime}
• Resolution within ${ticket.sla.resolutionTime}

${ticket.resolution ? `\nResolution:\n${ticket.resolution}` : ''}`;
}

/**
 * Get common banking issues and quick solutions
 */
export function getQuickSolutions(issueType: BankingIssueType): string {
    const solutions: Record<BankingIssueType, string> = {
        card_issue: `Card Issues - Quick Solutions:

1. Card Declined
   - Check if card is activated
   - Verify sufficient balance
   - Ensure card hasn't expired

2. Card Blocked
   - Call customer service
   - Visit nearest branch with ID
   - Use mobile app to unblock

3. Card Lost/Stolen
   - Block immediately via app or *123#
   - Visit branch for replacement`,

        transaction_dispute: `Transaction Disputes:

We take unauthorized transactions seriously.

Required Information:
• Transaction date and amount
• Merchant name (if visible)
• Your location at the time

Next Steps:
1. We'll block the card immediately
2. Investigation within 24 hours
3. Provisional credit if applicable
4. Final resolution in 5-7 days`,

        account_access: `Account Access Issues:

Can't access your account?

Try:
1. Reset password via "Forgot Password"
2. Clear browser cache/cookies
3. Use mobile app instead of web
4. Verify internet connection

Still stuck? We'll help you immediately.`,

        atm_issue: `ATM Issues:

Common problems:

1. Card stuck in ATM
   - Note ATM location
   - Call customer service
   - We'll send technician within 2 hours

2. Cash not dispensed
   - Keep transaction receipt
   - Report within 24 hours
   - Refund processed in 48 hours`,

        online_banking: `Online Banking Help:

• First time login: Use account number as username
• Forgot password: Use "Reset Password"
• Transaction limits: Check settings
• Add beneficiary: Requires OTP

Need assistance? I can guide you step by step.`,

        charges_complaint: `Charges & Fees:

We'll review:
• Service charges
• Transaction fees
• Penalty charges

Please provide:
• Date of charge
• Amount disputed
• Reason for complaint`,

        loan_inquiry: `Loan Inquiries:

I can help you with:
• Loan balance and status
• Repayment schedule
• Early settlement
• Refinancing options

What would you like to know?`,

        branch_service: `Branch Service:

How can I help?
• Find nearest branch
• Branch hours
• Book appointment
• Required documents

Branch Hours:
Mon-Fri: 8:00 AM - 4:00 PM
Saturday: 9:00 AM - 1:00 PM`,

        other: `Other Banking Issues:

Please describe your issue and I'll:
1. Provide immediate guidance
2. Create a ticket if needed
3. Connect you with the right team

What can I help you with today?`,
    };

    return solutions[issueType] || solutions.other;
}
