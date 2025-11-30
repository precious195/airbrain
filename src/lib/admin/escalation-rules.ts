// src/lib/admin/escalation-rules.ts

/**
 * Admin module - Escalation rules management
 */

export interface EscalationRule {
    id: string;
    name: string;
    description: string;
    industry: 'banking' | 'microfinance' | 'insurance' | 'mobile' | 'television' | 'all';
    priority: number; // 1-10, higher = more important
    active: boolean;
    conditions: EscalationCondition[];
    actions: EscalationAction[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    triggeredCount: number;
}

export interface EscalationCondition {
    type: 'confidence' | 'sentiment' | 'keyword' | 'conversation_length' | 'customer_tier' | 'time' | 'amount';
    operator: 'less_than' | 'greater_than' | 'equals' | 'contains' | 'not_contains';
    value: string | number;
    logic?: 'AND' | 'OR'; // For combining with next condition
}

export interface EscalationAction {
    type: 'assign_agent' | 'create_ticket' | 'notify' | 'transfer_department' | 'send_sms' | 'call_customer';
    target: string; // Agent ID, department, phone number, etc.
    priority: 'low' | 'medium' | 'high' | 'urgent';
    template?: string; // Message template for notifications
}

export interface EscalationLog {
    id: string;
    ruleId: string;
    ruleName: string;
    conversationId: string;
    customerId: string;
    triggeredAt: string;
    conditions: Array<{ condition: string; value: any; matched: boolean }>;
    actionsExecuted: Array<{ action: string; status: 'success' | 'failed'; details: string }>;
    resolvedAt?: string;
    resolvedBy?: string;
}

/**
 * Get all escalation rules
 */
export async function getEscalationRules(industry?: string): Promise<EscalationRule[]> {
    // TODO: Query from Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock rules
    return [
        {
            id: 'ESC001',
            name: 'Low Confidence Escalation',
            description: 'Escalate to agent when AI confidence is below 60%',
            industry: 'all',
            priority: 8,
            active: true,
            conditions: [
                {
                    type: 'confidence',
                    operator: 'less_than',
                    value: 60,
                },
            ],
            actions: [
                {
                    type: 'assign_agent',
                    target: 'available',
                    priority: 'medium',
                },
                {
                    type: 'notify',
                    target: 'supervisor@company.com',
                    priority: 'low',
                    template: 'Low confidence conversation assigned to {agentName}',
                },
            ],
            createdBy: 'admin@company.com',
            createdAt: '2024-01-10',
            updatedAt: '2024-11-15',
            triggeredCount: 1234,
        },
        {
            id: 'ESC002',
            name: 'Negative Sentiment Alert',
            description: 'Immediate escalation for very negative customer sentiment',
            industry: 'all',
            priority: 10,
            active: true,
            conditions: [
                {
                    type: 'sentiment',
                    operator: 'less_than',
                    value: -0.7,
                    logic: 'OR',
                },
                {
                    type: 'keyword',
                    operator: 'contains',
                    value: 'manager,supervisor,complaint,angry,terrible',
                },
            ],
            actions: [
                {
                    type: 'assign_agent',
                    target: 'senior',
                    priority: 'urgent',
                },
                {
                    type: 'notify',
                    target: 'manager@company.com',
                    priority: 'urgent',
                    template: 'Urgent: Negative sentiment detected in conversation {conversationId}',
                },
            ],
            createdBy: 'admin@company.com',
            createdAt: '2024-01-10',
            updatedAt: '2024-11-15',
            triggeredCount: 456,
        },
        {
            id: 'ESC003',
            name: 'High Value Transaction',
            description: 'Escalate transactions over K50,000',
            industry: 'banking',
            priority: 9,
            active: true,
            conditions: [
                {
                    type: 'amount',
                    operator: 'greater_than',
                    value: 50000,
                },
            ],
            actions: [
                {
                    type: 'create_ticket',
                    target: 'fraud_team',
                    priority: 'high',
                },
                {
                    type: 'send_sms',
                    target: '{customerPhone}',
                    priority: 'high',
                    template: 'High value transaction detected. If this was not you, call us immediately.',
                },
            ],
            createdBy: 'admin@bank.com',
            createdAt: '2024-02-05',
            updatedAt: '2024-11-20',
            triggeredCount: 89,
        },
        {
            id: 'ESC004',
            name: 'VIP Customer Priority',
            description: 'Fast-track VIP customers to senior agents',
            industry: 'all',
            priority: 9,
            active: true,
            conditions: [
                {
                    type: 'customer_tier',
                    operator: 'equals',
                    value: 'vip',
                },
            ],
            actions: [
                {
                    type: 'assign_agent',
                    target: 'vip_team',
                    priority: 'high',
                },
            ],
            createdBy: 'admin@company.com',
            createdAt: '2024-03-12',
            updatedAt: '2024-11-18',
            triggeredCount: 234,
        },
        {
            id: 'ESC005',
            name: 'Long Conversation Alert',
            description: 'Escalate conversations with more than 15 messages',
            industry: 'all',
            priority: 7,
            active: true,
            conditions: [
                {
                    type: 'conversation_length',
                    operator: 'greater_than',
                    value: 15,
                },
            ],
            actions: [
                {
                    type: 'assign_agent',
                    target: 'available',
                    priority: 'medium',
                },
            ],
            createdBy: 'admin@company.com',
            createdAt: '2024-04-01',
            updatedAt: '2024-11-10',
            triggeredCount: 567,
        },
    ];
}

/**
 * Create escalation rule
 */
export async function createEscalationRule(
    rule: Omit<EscalationRule, 'id' | 'createdAt' | 'updatedAt' | 'triggeredCount'>
): Promise<{ success: boolean; message: string; ruleId?: string }> {
    // TODO: Save to Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate rule
    if (rule.conditions.length === 0) {
        return {
            success: false,
            message: 'At least one condition is required',
        };
    }

    if (rule.actions.length === 0) {
        return {
            success: false,
            message: 'At least one action is required',
        };
    }

    const ruleId = `ESC${Date.now()}`;

    return {
        success: true,
        message: `Escalation rule "${rule.name}" created successfully`,
        ruleId,
    };
}

/**
 * Update escalation rule
 */
export async function updateEscalationRule(
    ruleId: string,
    updates: Partial<EscalationRule>
): Promise<{ success: boolean; message: string }> {
    // TODO: Update in Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        success: true,
        message: `Rule ${ruleId} updated successfully`,
    };
}

/**
 * Delete escalation rule
 */
export async function deleteEscalationRule(
    ruleId: string
): Promise<{ success: boolean; message: string }> {
    // TODO: Delete from Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        success: true,
        message: `Rule ${ruleId} deleted successfully`,
    };
}

/**
 * Test escalation rule against sample data
 */
export function testEscalationRule(
    rule: EscalationRule,
    testData: {
        confidence?: number;
        sentiment?: number;
        message?: string;
        conversationLength?: number;
        customerTier?: string;
        amount?: number;
    }
): { shouldEscalate: boolean; matchedConditions: string[]; failedConditions: string[] } {
    const matchedConditions: string[] = [];
    const failedConditions: string[] = [];
    let shouldEscalate = false;
    let logicChain: boolean[] = [];

    for (let i = 0; i < rule.conditions.length; i++) {
        const condition = rule.conditions[i];
        let matched = false;

        switch (condition.type) {
            case 'confidence':
                if (testData.confidence !== undefined) {
                    matched = evaluateCondition(testData.confidence, condition.operator, Number(condition.value));
                }
                break;
            case 'sentiment':
                if (testData.sentiment !== undefined) {
                    matched = evaluateCondition(testData.sentiment, condition.operator, Number(condition.value));
                }
                break;
            case 'keyword':
                if (testData.message) {
                    const keywords = String(condition.value).split(',');
                    matched = condition.operator === 'contains'
                        ? keywords.some(k => testData.message!.toLowerCase().includes(k.toLowerCase()))
                        : !keywords.some(k => testData.message!.toLowerCase().includes(k.toLowerCase()));
                }
                break;
            case 'conversation_length':
                if (testData.conversationLength !== undefined) {
                    matched = evaluateCondition(testData.conversationLength, condition.operator, Number(condition.value));
                }
                break;
            case 'customer_tier':
                if (testData.customerTier) {
                    matched = testData.customerTier === condition.value;
                }
                break;
            case 'amount':
                if (testData.amount !== undefined) {
                    matched = evaluateCondition(testData.amount, condition.operator, Number(condition.value));
                }
                break;
        }

        if (matched) {
            matchedConditions.push(`${condition.type} ${condition.operator} ${condition.value}`);
        } else {
            failedConditions.push(`${condition.type} ${condition.operator} ${condition.value}`);
        }

        logicChain.push(matched);

        // Evaluate logic chain
        if (i > 0 && rule.conditions[i - 1].logic) {
            const logic = rule.conditions[i - 1].logic;
            if (logic === 'OR') {
                shouldEscalate = logicChain[logicChain.length - 2] || logicChain[logicChain.length - 1];
            } else { // AND
                shouldEscalate = logicChain[logicChain.length - 2] && logicChain[logicChain.length - 1];
            }
        } else if (i === rule.conditions.length - 1) {
            // Last condition, evaluate entire chain
            shouldEscalate = logicChain.every(Boolean); // Default to AND if no logic specified
        }
    }

    return {
        shouldEscalate,
        matchedConditions,
        failedConditions,
    };
}

function evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
        case 'less_than':
            return value < threshold;
        case 'greater_than':
            return value > threshold;
        case 'equals':
            return value === threshold;
        default:
            return false;
    }
}

/**
 * Get escalation logs
 */
export async function getEscalationLogs(
    filters?: {
        ruleId?: string;
        customerId?: string;
        dateFrom?: string;
        dateTo?: string;
    }
): Promise<EscalationLog[]> {
    // TODO: Query from Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
        {
            id: 'LOG001',
            ruleId: 'ESC001',
            ruleName: 'Low Confidence Escalation',
            conversationId: 'CONV12345',
            customerId: 'CUST67890',
            triggeredAt: new Date(Date.now() - 3600000).toISOString(),
            conditions: [
                { condition: 'confidence < 60', value: 45, matched: true },
            ],
            actionsExecuted: [
                { action: 'assign_agent', status: 'success', details: 'Assigned to Agent Sarah (AGT001)' },
                { action: 'notify supervisor', status: 'success', details: 'Email sent to supervisor@company.com' },
            ],
            resolvedAt: new Date(Date.now() - 1800000).toISOString(),
            resolvedBy: 'AGT001',
        },
    ];
}

/**
 * Get escalation statistics
 */
export async function getEscalationStatistics(): Promise<{
    totalEscalations: number;
    byRule: Array<{ ruleId: string; ruleName: string; count: number }>;
    byPriority: Record<string, number>;
    avgResolutionTime: number; // minutes
    topTriggers: Array<{ condition: string; count: number }>;
}> {
    // TODO: Query statistics from Firebase

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        totalEscalations: 2580,
        byRule: [
            { ruleId: 'ESC001', ruleName: 'Low Confidence', count: 1234 },
            { ruleId: 'ESC005', ruleName: 'Long Conversation', count: 567 },
            { ruleId: 'ESC002', ruleName: 'Negative Sentiment', count: 456 },
        ],
        byPriority: {
            urgent: 145,
            high: 567,
            medium: 1234,
            low: 634,
        },
        avgResolutionTime: 18.5,
        topTriggers: [
            { condition: 'confidence < 60', count: 1234 },
            { condition: 'conversation_length > 15', count: 567 },
            { condition: 'sentiment < -0.7', count: 456 },
        ],
    };
}
