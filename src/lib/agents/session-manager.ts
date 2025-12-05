/**
 * Agent Session Manager
 * 
 * Manages persistent sessions for agents interacting with external systems.
 * Handles authentication state, cookies, and context across multiple operations.
 */

import { SystemProfile } from './universal-agent';
import { APIProfile } from './api-discovery';

export interface AuthState {
    type: 'none' | 'session' | 'token' | 'api_key';
    isAuthenticated: boolean;
    expiresAt?: number;
    token?: string;
    refreshToken?: string;
    cookies?: Record<string, string>;
}

export interface AgentSession {
    id: string;
    companyId: string;
    systemUrl: string;
    systemType: 'api' | 'browser' | 'hybrid';

    // State
    authState: AuthState;
    lastActivity: number;
    createdAt: number;

    // Cached knowledge
    systemProfile?: SystemProfile;
    apiProfile?: APIProfile;

    // Execution context
    variables: Record<string, any>;
    executionHistory: {
        action: string;
        timestamp: number;
        success: boolean;
        error?: string;
    }[];

    // Browser state (if applicable)
    browserPage?: any;
    browserContext?: any;
}

export class AgentSessionManager {
    private sessions: Map<string, AgentSession> = new Map();
    private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startCleanup();
    }

    /**
     * Start automatic cleanup of expired sessions
     */
    private startCleanup(): void {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [id, session] of Array.from(this.sessions.entries())) {
                if (now - session.lastActivity > this.SESSION_TIMEOUT) {
                    console.log(`🧹 Cleaning up expired session: ${id}`);
                    this.closeSession(id);
                }
            }
        }, 60 * 1000); // Check every minute
    }

    /**
     * Create or get existing session
     */
    getOrCreateSession(companyId: string, systemUrl: string, systemType: 'api' | 'browser' | 'hybrid' = 'hybrid'): AgentSession {
        const sessionId = `${companyId}_${Buffer.from(systemUrl).toString('base64').substring(0, 16)}`;

        let session = this.sessions.get(sessionId);

        if (session) {
            session.lastActivity = Date.now();
            return session;
        }

        session = {
            id: sessionId,
            companyId,
            systemUrl,
            systemType,
            authState: {
                type: 'none',
                isAuthenticated: false
            },
            lastActivity: Date.now(),
            createdAt: Date.now(),
            variables: {},
            executionHistory: []
        };

        this.sessions.set(sessionId, session);
        console.log(`📝 Created new session: ${sessionId} for ${systemUrl}`);

        return session;
    }

    /**
     * Get session by ID
     */
    getSession(sessionId: string): AgentSession | undefined {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = Date.now();
        }
        return session;
    }

    /**
     * Update session authentication state
     */
    updateAuthState(sessionId: string, authState: Partial<AuthState>): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.authState = { ...session.authState, ...authState };
            session.lastActivity = Date.now();
        }
    }

    /**
     * Store variable in session
     */
    setVariable(sessionId: string, key: string, value: any): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.variables[key] = value;
            session.lastActivity = Date.now();
        }
    }

    /**
     * Get variable from session
     */
    getVariable(sessionId: string, key: string): any {
        const session = this.sessions.get(sessionId);
        return session?.variables[key];
    }

    /**
     * Log an execution action
     */
    logExecution(sessionId: string, action: string, success: boolean, error?: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.executionHistory.push({
                action,
                timestamp: Date.now(),
                success,
                error
            });
            session.lastActivity = Date.now();

            // Keep only last 100 entries
            if (session.executionHistory.length > 100) {
                session.executionHistory = session.executionHistory.slice(-100);
            }
        }
    }

    /**
     * Cache system profile
     */
    cacheSystemProfile(sessionId: string, profile: SystemProfile): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.systemProfile = profile;
            session.lastActivity = Date.now();
        }
    }

    /**
     * Cache API profile
     */
    cacheAPIProfile(sessionId: string, profile: APIProfile): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.apiProfile = profile;
            session.lastActivity = Date.now();
        }
    }

    /**
     * Check if session is authenticated
     */
    isAuthenticated(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        // Check if auth has expired
        if (session.authState.expiresAt && Date.now() > session.authState.expiresAt) {
            session.authState.isAuthenticated = false;
            return false;
        }

        return session.authState.isAuthenticated;
    }

    /**
     * Close and cleanup a session
     */
    async closeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session) {
            // Close browser if open
            if (session.browserContext) {
                try {
                    await session.browserContext.close();
                } catch { }
            }

            this.sessions.delete(sessionId);
            console.log(`🔒 Closed session: ${sessionId}`);
        }
    }

    /**
     * Get all active sessions for a company
     */
    getCompanySessions(companyId: string): AgentSession[] {
        return Array.from(this.sessions.values())
            .filter(s => s.companyId === companyId);
    }

    /**
     * Get session statistics
     */
    getStats(): {
        totalSessions: number;
        authenticatedSessions: number;
        averageAge: number;
    } {
        const sessions = Array.from(this.sessions.values());
        const now = Date.now();

        return {
            totalSessions: sessions.length,
            authenticatedSessions: sessions.filter(s => s.authState.isAuthenticated).length,
            averageAge: sessions.length > 0
                ? sessions.reduce((sum, s) => sum + (now - s.createdAt), 0) / sessions.length
                : 0
        };
    }

    /**
     * Cleanup resources
     */
    async shutdown(): Promise<void> {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        for (const sessionId of Array.from(this.sessions.keys())) {
            await this.closeSession(sessionId);
        }
    }
}

// Singleton instance
export const agentSessionManager = new AgentSessionManager();
