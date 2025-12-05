/**
 * Agent Exports
 * 
 * Central export point for all agent-related functionality.
 * This module provides the complete Universal System Agent capability.
 */

// Core Agent
export {
    UniversalAgent,
    createUniversalAgent,
    type AgentAction,
    type AgentTask,
    type SystemProfile,
    type ActionType
} from './universal-agent';

// System Learning
export {
    SystemLearner,
    systemLearner,
    type SystemKnowledge,
    type DiscoveredField,
    type DiscoveredForm,
    type DiscoveredAction
} from './system-learner';

// Human-Like Interaction
export {
    HumanLikeAgent,
    createHumanLikeAgent,
    type ConversationContext,
    type AgentResponse
} from './human-like-agent';

// API Discovery
export {
    APIDiscovery,
    apiDiscovery,
    type APIEndpoint,
    type APIProfile
} from './api-discovery';

// Workflow Orchestration
export {
    WorkflowExecutor,
    createWorkflowExecutor,
    type Workflow,
    type WorkflowStep,
    type StepType
} from './workflow-executor';

// Session Management
export {
    AgentSessionManager,
    agentSessionManager,
    type AgentSession,
    type AuthState
} from './session-manager';

// OTP Handling
export {
    otpHandler,
    type OTPRequest,
    type OTPDetectionResult
} from './otp-handler';
