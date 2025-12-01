// src/lib/ai/reasoning-engine.ts

/**
 * AI Brain - Automated reasoning and decision-making engine
 */

export interface ReasoningContext {
    conversationId: string;
    customerInfo: {
        id: string;
        name?: string;
        tier?: 'regular' | 'vip';
        industry: string;
        language?: 'en' | 'bem' | 'ny';
    };
    currentMessage: string;
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
    detectedIntent?: string;
    confidence?: number;
    entities?: Record<string, any>;
}

export interface ReasoningResult {
    decision: 'respond' | 'escalate' | 'execute_action' | 'request_info';
    reasoning: string[];
    confidence: number; // 0-100
    suggestedResponse?: string;
    requiredAction?: {
        type: string;
        params: Record<string, any>;
    };
    escalationReason?: string;
    missingInfo?: string[];
}

/**
 * Reasoning engine - decides how to handle each interaction
 */
export class ReasoningEngine {
    /**
     * Analyze conversation and determine best course of action
     */
    async analyze(context: ReasoningContext): Promise<ReasoningResult> {
        const reasoning: string[] = [];
        let decision: ReasoningResult['decision'] = 'respond';
        let confidence = 100;

        // Step 1: Check if we have enough information
        const missingInfo = this.checkMissingInformation(context);
        if (missingInfo.length > 0) {
            reasoning.push(`Missing information: ${missingInfo.join(', ')}`);
            return {
                decision: 'request_info',
                reasoning,
                confidence: 90,
                missingInfo,
            };
        }

        // Step 2: Check confidence level
        if (context.confidence && context.confidence < 60) {
            reasoning.push(`Low confidence (${context.confidence}%) - escalating to human`);
            return {
                decision: 'escalate',
                reasoning,
                confidence: context.confidence,
                escalationReason: 'Low AI confidence in understanding request',
            };
        }

        // Step 3: Check for urgent/critical intents
        const urgentIntents = ['fraud_report', 'card_lost', 'account_hack', 'emergency'];
        if (context.detectedIntent && urgentIntents.includes(context.detectedIntent)) {
            reasoning.push(`Urgent intent detected: ${context.detectedIntent}`);
            return {
                decision: 'escalate',
                reasoning,
                confidence: 95,
                escalationReason: `Urgent ${context.detectedIntent} requires immediate human attention`,
            };
        }

        // Step 4: Check for VIP customers
        if (context.customerInfo.tier === 'vip') {
            reasoning.push('VIP customer - ensuring premium service');
            confidence = Math.min(confidence, 85); // Lower threshold for VIP
        }

        // Step 5: Check conversation length (too many back-and-forth)
        if (context.conversationHistory.length > 15) {
            reasoning.push(`Long conversation (${context.conversationHistory.length} messages) - may need human touch`);
            return {
                decision: 'escalate',
                reasoning,
                confidence: 70,
                escalationReason: 'Extended conversation suggests complex issue',
            };
        }

        // Step 6: Determine if action can be executed
        const actionableIntent = this.isActionableIntent(context.detectedIntent);
        if (actionableIntent) {
            const action = this.determineAction(context);
            if (action) {
                reasoning.push(`Executable action identified: ${action.type}`);
                return {
                    decision: 'execute_action',
                    reasoning,
                    confidence: 85,
                    requiredAction: action,
                };
            }
        }

        // Step 7: Check sentiment
        const sentiment = this.analyzeSentiment(context.currentMessage);
        if (sentiment.score < -0.7) {
            reasoning.push(`Very negative sentiment detected (${sentiment.score})`);
            reasoning.push('Customer appears frustrated - consider escalation');
            confidence = Math.min(confidence, 70);
        }

        // Step 8: Default to respond with confidence
        reasoning.push('AI can handle this request confidently');
        return {
            decision: 'respond',
            reasoning,
            confidence,
        };
    }

    /**
     * Check for missing information needed to fulfill request
     */
    private checkMissingInformation(context: ReasoningContext): string[] {
        const missing: string[] = [];
        const intent = context.detectedIntent;

        // Intent-specific required information
        const requirementsMap: Record<string, string[]> = {
            balance_check: ['account_number'],
            fund_transfer: ['from_account', 'to_account', 'amount'],
            loan_application: ['monthly_income', 'employment_status'],
            insurance_quote: ['insurance_type', 'coverage_amount'],
            bundle_purchase: ['bundle_type', 'phone_number'],
        };

        if (intent && requirementsMap[intent]) {
            const required = requirementsMap[intent];
            const provided = context.entities || {};

            required.forEach(field => {
                if (!provided[field]) {
                    missing.push(field);
                }
            });
        }

        return missing;
    }

    /**
     * Check if intent can be directly executed
     */
    private isActionableIntent(intent?: string): boolean {
        const actionableIntents = [
            'balance_check',
            'mini_statement',
            'bundle_purchase',
            'payment_reminder',
            'pin_reset',
            'decoder_reset',
        ];

        return intent ? actionableIntents.includes(intent) : false;
    }

    /**
     * Determine specific action to execute
     */
    private determineAction(context: ReasoningContext): ReasoningResult['requiredAction'] | null {
        const intent = context.detectedIntent;
        const entities = context.entities || {};

        const actionMap: Record<string, any> = {
            balance_check: {
                type: 'get_balance',
                params: {
                    accountNumber: entities.account_number,
                    customerId: context.customerInfo.id,
                },
            },
            mini_statement: {
                type: 'get_statement',
                params: {
                    accountNumber: entities.account_number,
                    transactionCount: 5,
                },
            },
            bundle_purchase: {
                type: 'purchase_bundle',
                params: {
                    bundleId: entities.bundle_type,
                    phoneNumber: entities.phone_number,
                },
            },
        };

        return intent ? actionMap[intent] : null;
    }

    /**
     * Analyze sentiment of message
     */
    private analyzeSentiment(message: string): { score: number; label: string } {
        // Simple keyword-based sentiment (would use Gemini API in production)
        const positiveWords = ['thank', 'great', 'good', 'excellent', 'appreciate', 'helpful'];
        const negativeWords = ['bad', 'terrible', 'angry', 'frustrated', 'worst', 'useless', 'hate'];

        const lowerMessage = message.toLowerCase();
        let score = 0;

        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) score += 0.2;
        });

        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) score -= 0.3;
        });

        score = Math.max(-1, Math.min(1, score));

        const label = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral';

        return { score, label };
    }

    /**
     * Generate explanation for decision
     */
    explainDecision(result: ReasoningResult): string {
        let explanation = `Decision: ${result.decision.toUpperCase()}\n`;
        explanation += `Confidence: ${result.confidence}%\n\n`;
        explanation += 'Reasoning:\n';
        result.reasoning.forEach((reason, index) => {
            explanation += `${index + 1}. ${reason}\n`;
        });

        if (result.escalationReason) {
            explanation += `\nEscalation Reason: ${result.escalationReason}`;
        }

        if (result.missingInfo && result.missingInfo.length > 0) {
            explanation += `\nMissing Information: ${result.missingInfo.join(', ')}`;
        }

        return explanation;
    }

    /**
     * Simplified decision method for VoiceAgent
     * Adapts VoiceAgent's input format to ReasoningEngine's analyze method
     */
    async decideAction(input: {
        conversationId: string;
        lastMessage: string;
        intent: any;
        context: Record<string, any>;
    }): Promise<{ action: string; reasoning?: string }> {
        // Build ReasoningContext from VoiceAgent input
        const reasoningContext: ReasoningContext = {
            conversationId: input.conversationId,
            customerInfo: {
                id: input.context.customerId || 'unknown',
                name: input.context.customerName,
                tier: input.context.tier || 'regular',
                industry: input.context.industry || 'mobile',
                language: input.context.language || 'en',
            },
            currentMessage: input.lastMessage,
            conversationHistory: input.context.history || [],
            detectedIntent: input.intent?.intent || input.intent?.primaryIntent,
            confidence: input.intent?.confidence ? input.intent.confidence * 100 : 80,
            entities: input.context.entities || {},
        };

        // Call analyze method
        const result = await this.analyze(reasoningContext);

        // Map decision to VoiceAgent's expected format
        const actionMap: Record<string, string> = {
            'respond': 'RESPOND',
            'escalate': 'ESCALATE',
            'execute_action': 'EXECUTE_ACTION',
            'request_info': 'REQUEST_INFO',
        };

        return {
            action: actionMap[result.decision] || 'RESPOND',
            reasoning: result.reasoning.join('; '),
        };
    }
}

/**
 * Chain of thought reasoning for complex queries
 */
export class ChainOfThoughtReasoner {
    async reason(problem: string, context: Record<string, any>): Promise<{
        steps: Array<{ step: number; thought: string; conclusion: string }>;
        finalAnswer: string;
    }> {
        // TODO: Implement with Gemini API for complex reasoning

        const steps = [
            {
                step: 1,
                thought: 'Analyzing the customer request to understand the core need',
                conclusion: 'Customer wants to check eligibility for a loan',
            },
            {
                step: 2,
                thought: 'Checking required information: income, employment, credit score',
                conclusion: 'Income provided (K5000), employment status needed',
            },
            {
                step: 3,
                thought: 'Determining next action based on available information',
                conclusion: 'Request employment status before proceeding',
            },
        ];

        const finalAnswer = 'Need to ask for employment status to complete loan eligibility check';

        return { steps, finalAnswer };
    }
}

/**
 * Multi-step problem solver
 */
export class ProblemSolver {
    async solve(problem: {
        description: string;
        constraints: string[];
        goals: string[];
    }): Promise<{
        solution: string;
        steps: string[];
        reasoning: string;
    }> {
        // Break down problem into steps
        const steps: string[] = [];

        // Analyze constraints
        steps.push('1. Analyze constraints and requirements');
        problem.constraints.forEach(constraint => {
            steps.push(`   - Consider: ${constraint}`);
        });

        // Identify solution path
        steps.push('2. Identify optimal solution path');

        // Verify against goals
        steps.push('3. Verify solution meets all goals');
        problem.goals.forEach(goal => {
            steps.push(`   - Check: ${goal}`);
        });

        const solution = 'Proposed solution based on analysis';
        const reasoning = 'Solution was chosen because it satisfies all constraints while meeting the stated goals';

        return { solution, steps, reasoning };
    }
}

/**
 * Decision tree for automated routing
 */
export class DecisionTree {
    async evaluate(
        input: Record<string, any>,
        tree: DecisionNode
    ): Promise<{ decision: string; path: string[] }> {
        const path: string[] = [];
        let currentNode = tree;

        while (currentNode) {
            path.push(currentNode.question);

            if (!currentNode.condition) {
                // Leaf node - final decision
                return {
                    decision: currentNode.action || 'unknown',
                    path,
                };
            }

            // Evaluate condition
            const result = this.evaluateCondition(input, currentNode.condition);
            currentNode = result ? currentNode.trueNode! : currentNode.falseNode!;
        }

        return { decision: 'error', path };
    }

    private evaluateCondition(input: Record<string, any>, condition: any): boolean {
        // Simple condition evaluation
        const [field, operator, value] = condition;
        const inputValue = input[field];

        switch (operator) {
            case '==':
                return inputValue === value;
            case '>':
                return inputValue > value;
            case '<':
                return inputValue < value;
            case '>=':
                return inputValue >= value;
            case '<=':
                return inputValue <= value;
            default:
                return false;
        }
    }
}

interface DecisionNode {
    question: string;
    condition?: any;
    action?: string;
    trueNode?: DecisionNode;
    falseNode?: DecisionNode;
}

export const reasoningEngine = new ReasoningEngine();
