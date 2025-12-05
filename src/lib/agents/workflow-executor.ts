/**
 * Workflow Executor
 * 
 * Orchestrates complex multi-step workflows across different systems.
 * Handles retries, rollbacks, and state management.
 */

import { geminiProvider } from '../ai/gemini-provider';
import { UniversalAgent, AgentAction } from './universal-agent';
import { apiDiscovery, APIEndpoint } from './api-discovery';

export type StepType = 'api' | 'browser' | 'condition' | 'loop' | 'delay' | 'parallel' | 'human_approval';

export interface WorkflowStep {
    id: string;
    name: string;
    type: StepType;
    description: string;

    // For API steps
    apiEndpoint?: string;
    apiMethod?: string;
    apiParams?: Record<string, any>;

    // For browser steps
    browserActions?: AgentAction[];

    // For condition steps
    condition?: string;  // Expression to evaluate
    onTrue?: string;     // Step ID to go to if true
    onFalse?: string;    // Step ID to go to if false

    // For loop steps
    loopOver?: string;   // Variable name containing array
    loopSteps?: string[]; // Step IDs to execute for each item

    // For parallel steps
    parallelSteps?: string[]; // Step IDs to execute in parallel

    // For delay steps
    delayMs?: number;

    // For human approval
    approvalMessage?: string;

    // Common
    retryCount?: number;
    timeout?: number;
    onError?: 'abort' | 'continue' | 'retry' | 'rollback';
    rollbackSteps?: string[];
    outputVariable?: string;
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    variables: Record<string, any>;
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
    currentStepIndex: number;
    executionLog: {
        stepId: string;
        status: 'success' | 'failed' | 'skipped';
        output?: any;
        error?: string;
        timestamp: number;
    }[];
}

export class WorkflowExecutor {
    private companyId: string;
    private universalAgent: UniversalAgent;
    private activeWorkflows: Map<string, Workflow> = new Map();

    constructor(companyId: string) {
        this.companyId = companyId;
        this.universalAgent = new UniversalAgent(companyId);
    }

    /**
     * Generate a workflow from natural language
     */
    async generateWorkflow(goal: string, context: Record<string, any> = {}): Promise<Workflow> {
        console.log(`🔄 Generating workflow for: "${goal}"`);

        const prompt = `You are a workflow automation expert. Create a detailed workflow to accomplish this goal:

GOAL: ${goal}

CONTEXT:
${JSON.stringify(context, null, 2)}

Create a workflow with the following structure. Each step should be atomic and specific.

Return a JSON workflow:
{
  "id": "wf_${Date.now()}",
  "name": "Workflow name",
  "description": "What this workflow accomplishes",
  "steps": [
    {
      "id": "step_1",
      "name": "Step name",
      "type": "api|browser|condition|delay",
      "description": "What this step does",
      "apiEndpoint": "/api/endpoint",
      "apiMethod": "GET|POST|PUT|DELETE",
      "apiParams": {"key": "value"},
      "browserActions": [{"type": "click", "target": "#button"}],
      "outputVariable": "result"
    }
  ],
  "variables": {}
}

Available step types:
- api: Make an API call
- browser: Perform browser automation
- condition: Branch based on a condition
- loop: Repeat steps for each item
- parallel: Execute steps concurrently
- delay: Wait for a specified time
- human_approval: Pause for human approval

Return ONLY valid JSON.`;

        try {
            const response = await geminiProvider.generateResponse(prompt, true);
            const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
            const workflow: Workflow = JSON.parse(cleaned);

            workflow.status = 'pending';
            workflow.currentStepIndex = 0;
            workflow.executionLog = [];

            this.activeWorkflows.set(workflow.id, workflow);
            console.log(`✅ Generated workflow with ${workflow.steps.length} steps`);

            return workflow;
        } catch (error: any) {
            console.error('Workflow generation failed:', error.message);
            throw new Error('Failed to generate workflow');
        }
    }

    /**
     * Execute a workflow
     */
    async executeWorkflow(workflow: Workflow): Promise<{ success: boolean; result: any }> {
        console.log(`▶️ Executing workflow: ${workflow.name}`);

        workflow.status = 'running';
        this.activeWorkflows.set(workflow.id, workflow);

        try {
            while (workflow.currentStepIndex < workflow.steps.length) {
                const step = workflow.steps[workflow.currentStepIndex];

                console.log(`  📌 Step ${workflow.currentStepIndex + 1}/${workflow.steps.length}: ${step.name}`);

                try {
                    const result = await this.executeStep(step, workflow);

                    // Store result in variable if specified
                    if (step.outputVariable) {
                        workflow.variables[step.outputVariable] = result;
                    }

                    workflow.executionLog.push({
                        stepId: step.id,
                        status: 'success',
                        output: result,
                        timestamp: Date.now()
                    });

                    workflow.currentStepIndex++;

                } catch (error: any) {
                    console.error(`  ❌ Step failed: ${error.message}`);

                    workflow.executionLog.push({
                        stepId: step.id,
                        status: 'failed',
                        error: error.message,
                        timestamp: Date.now()
                    });

                    // Handle error based on step configuration
                    if (step.onError === 'continue') {
                        workflow.currentStepIndex++;
                    } else if (step.onError === 'retry' && (step.retryCount || 0) > 0) {
                        step.retryCount = (step.retryCount || 1) - 1;
                        await this.delay(1000);
                    } else if (step.onError === 'rollback' && step.rollbackSteps) {
                        await this.executeRollback(workflow, step.rollbackSteps);
                        throw error;
                    } else {
                        throw error;
                    }
                }
            }

            workflow.status = 'completed';
            console.log(`✅ Workflow completed successfully`);

            return { success: true, result: workflow.variables };

        } catch (error: any) {
            workflow.status = 'failed';
            console.error(`❌ Workflow failed: ${error.message}`);
            return { success: false, result: { error: error.message } };
        }
    }

    /**
     * Execute a single step
     */
    private async executeStep(step: WorkflowStep, workflow: Workflow): Promise<any> {
        switch (step.type) {
            case 'api':
                return await this.executeAPIStep(step, workflow);

            case 'browser':
                return await this.executeBrowserStep(step, workflow);

            case 'condition':
                return await this.executeConditionStep(step, workflow);

            case 'loop':
                return await this.executeLoopStep(step, workflow);

            case 'parallel':
                return await this.executeParallelStep(step, workflow);

            case 'delay':
                await this.delay(step.delayMs || 1000);
                return { waited: step.delayMs };

            case 'human_approval':
                return await this.executeHumanApprovalStep(step, workflow);

            default:
                throw new Error(`Unknown step type: ${step.type}`);
        }
    }

    /**
     * Execute API step
     */
    private async executeAPIStep(step: WorkflowStep, workflow: Workflow): Promise<any> {
        if (!step.apiEndpoint) {
            throw new Error('API endpoint not specified');
        }

        // Replace variables in params
        const params = this.replaceVariables(step.apiParams || {}, workflow.variables);

        const response = await fetch(step.apiEndpoint, {
            method: step.apiMethod || 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: ['POST', 'PUT', 'PATCH'].includes(step.apiMethod || '')
                ? JSON.stringify(params)
                : undefined
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Execute browser step
     */
    private async executeBrowserStep(step: WorkflowStep, workflow: Workflow): Promise<any> {
        if (!step.browserActions || step.browserActions.length === 0) {
            throw new Error('No browser actions specified');
        }

        const results: any[] = [];

        for (const action of step.browserActions) {
            // Replace variables in action values
            if (action.value) {
                action.value = this.replaceVariableString(action.value, workflow.variables);
            }

            const result = await this.universalAgent.executeAction(action);
            results.push(result);
        }

        return results;
    }

    /**
     * Execute condition step
     */
    private async executeConditionStep(step: WorkflowStep, workflow: Workflow): Promise<any> {
        if (!step.condition) {
            throw new Error('Condition not specified');
        }

        // Evaluate condition (simple variable comparison)
        const conditionResult = this.evaluateCondition(step.condition, workflow.variables);

        // Update current step index based on condition
        const nextStepId = conditionResult ? step.onTrue : step.onFalse;

        if (nextStepId) {
            const nextIndex = workflow.steps.findIndex(s => s.id === nextStepId);
            if (nextIndex >= 0) {
                workflow.currentStepIndex = nextIndex - 1; // -1 because it will be incremented
            }
        }

        return { condition: step.condition, result: conditionResult };
    }

    /**
     * Execute loop step
     */
    private async executeLoopStep(step: WorkflowStep, workflow: Workflow): Promise<any> {
        if (!step.loopOver || !step.loopSteps) {
            throw new Error('Loop configuration incomplete');
        }

        const items = workflow.variables[step.loopOver];
        if (!Array.isArray(items)) {
            throw new Error(`Variable ${step.loopOver} is not an array`);
        }

        const results: any[] = [];

        for (let i = 0; i < items.length; i++) {
            workflow.variables['_loopIndex'] = i;
            workflow.variables['_loopItem'] = items[i];

            for (const stepId of step.loopSteps) {
                const loopStep = workflow.steps.find(s => s.id === stepId);
                if (loopStep) {
                    const result = await this.executeStep(loopStep, workflow);
                    results.push(result);
                }
            }
        }

        return results;
    }

    /**
     * Execute parallel step
     */
    private async executeParallelStep(step: WorkflowStep, workflow: Workflow): Promise<any> {
        if (!step.parallelSteps || step.parallelSteps.length === 0) {
            throw new Error('No parallel steps specified');
        }

        const parallelStepsToExecute = step.parallelSteps
            .map(id => workflow.steps.find(s => s.id === id))
            .filter(s => s !== undefined) as WorkflowStep[];

        const results = await Promise.allSettled(
            parallelStepsToExecute.map(s => this.executeStep(s, workflow))
        );

        return results.map((r, i) => ({
            stepId: parallelStepsToExecute[i].id,
            status: r.status,
            result: r.status === 'fulfilled' ? r.value : r.reason?.message
        }));
    }

    /**
     * Execute human approval step
     */
    private async executeHumanApprovalStep(step: WorkflowStep, workflow: Workflow): Promise<any> {
        workflow.status = 'paused';
        console.log(`⏸️ Workflow paused for human approval: ${step.approvalMessage}`);

        // In a real implementation, this would:
        // 1. Send notification to appropriate user
        // 2. Wait for approval via webhook or polling
        // 3. Resume or abort based on response

        // For now, auto-approve after logging
        console.log(`✅ Auto-approved (demo mode)`);
        workflow.status = 'running';

        return { approved: true, approvalMessage: step.approvalMessage };
    }

    /**
     * Execute rollback steps
     */
    private async executeRollback(workflow: Workflow, rollbackStepIds: string[]): Promise<void> {
        console.log(`🔄 Executing rollback...`);

        for (const stepId of rollbackStepIds) {
            const step = workflow.steps.find(s => s.id === stepId);
            if (step) {
                try {
                    await this.executeStep(step, workflow);
                    console.log(`  ✅ Rollback step ${stepId} completed`);
                } catch (error: any) {
                    console.error(`  ❌ Rollback step ${stepId} failed: ${error.message}`);
                }
            }
        }
    }

    /**
     * Replace variables in object
     */
    private replaceVariables(obj: Record<string, any>, variables: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                result[key] = this.replaceVariableString(value, variables);
            } else if (typeof value === 'object' && value !== null) {
                result[key] = this.replaceVariables(value, variables);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * Replace variables in string
     */
    private replaceVariableString(str: string, variables: Record<string, any>): string {
        return str.replace(/\{(\w+)\}/g, (match, varName) => {
            return variables[varName] !== undefined ? String(variables[varName]) : match;
        });
    }

    /**
     * Evaluate a simple condition
     */
    private evaluateCondition(condition: string, variables: Record<string, any>): boolean {
        // Replace variables
        let expr = condition;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            expr = expr.replace(regex, JSON.stringify(value));
        }

        try {
            // Simple evaluation (for demo - use a proper expression parser in production)
            return new Function(`return ${expr}`)();
        } catch {
            return false;
        }
    }

    /**
     * Utility delay function
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get workflow status
     */
    getWorkflow(id: string): Workflow | undefined {
        return this.activeWorkflows.get(id);
    }

    /**
     * Pause a workflow
     */
    pauseWorkflow(id: string): void {
        const workflow = this.activeWorkflows.get(id);
        if (workflow && workflow.status === 'running') {
            workflow.status = 'paused';
        }
    }

    /**
     * Resume a paused workflow
     */
    async resumeWorkflow(id: string): Promise<{ success: boolean; result: any }> {
        const workflow = this.activeWorkflows.get(id);
        if (!workflow || workflow.status !== 'paused') {
            throw new Error('Workflow not found or not paused');
        }

        return this.executeWorkflow(workflow);
    }
}

export function createWorkflowExecutor(companyId: string): WorkflowExecutor {
    return new WorkflowExecutor(companyId);
}
