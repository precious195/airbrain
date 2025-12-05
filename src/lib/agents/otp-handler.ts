/**
 * OTP Handler Module
 * 
 * Detects OTP/2FA pages and manages human-in-the-loop verification flow.
 * Pauses automation workflow when OTP is required and waits for user input.
 */

import { Page } from 'playwright';
import { EventEmitter } from 'events';

export interface OTPRequest {
    id: string;
    sessionId: string;
    companyId: string;
    systemUrl: string;
    systemName: string;
    otpType: 'sms' | 'email' | 'authenticator' | 'unknown';
    inputSelector: string;
    submitSelector?: string;
    message: string;
    createdAt: number;
    expiresAt: number;
    status: 'pending' | 'received' | 'submitted' | 'expired' | 'cancelled';
    otpValue?: string;
}

export interface OTPDetectionResult {
    isOTPPage: boolean;
    otpType: 'sms' | 'email' | 'authenticator' | 'unknown';
    inputSelector: string;
    submitSelector?: string;
    message: string;
    confidence: number;
}

class OTPHandler extends EventEmitter {
    private pendingRequests: Map<string, OTPRequest> = new Map();
    private readonly DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    constructor() {
        super();
    }

    /**
     * Detect if current page is an OTP verification page
     */
    async detectOTPPage(page: Page): Promise<OTPDetectionResult> {
        const result = await page.evaluate(() => {
            const body = document.body.innerText.toLowerCase();
            const html = document.body.innerHTML.toLowerCase();

            // OTP indicators in text
            const otpKeywords = [
                'verification code',
                'otp',
                'one-time password',
                'one time password',
                '2fa',
                'two-factor',
                'two factor',
                'authentication code',
                'security code',
                'confirm your identity',
                'enter the code',
                'enter code',
                'code sent to',
                'we sent a code',
                'check your phone',
                'check your email'
            ];

            let isOTPPage = false;
            let matchedKeyword = '';

            for (const keyword of otpKeywords) {
                if (body.includes(keyword)) {
                    isOTPPage = true;
                    matchedKeyword = keyword;
                    break;
                }
            }

            // Detect OTP type
            let otpType: 'sms' | 'email' | 'authenticator' | 'unknown' = 'unknown';
            if (body.includes('sms') || body.includes('phone') || body.includes('mobile')) {
                otpType = 'sms';
            } else if (body.includes('email') || body.includes('inbox')) {
                otpType = 'email';
            } else if (body.includes('authenticator') || body.includes('google auth') || body.includes('authy')) {
                otpType = 'authenticator';
            }

            // Find OTP input field
            let inputSelector = '';
            let confidence = 0;

            // Look for tel/numeric inputs (common for OTP)
            const telInputs = document.querySelectorAll('input[type="tel"], input[inputmode="numeric"]');
            if (telInputs.length > 0) {
                const input = telInputs[0] as HTMLInputElement;
                if (input.id) {
                    inputSelector = `#${input.id}`;
                } else if (input.name) {
                    inputSelector = `input[name="${input.name}"]`;
                } else {
                    inputSelector = 'input[type="tel"]';
                }
                confidence = 0.9;
            }

            // Look for single-digit input boxes (common OTP pattern)
            const singleDigitInputs = document.querySelectorAll('input[maxlength="1"]');
            if (singleDigitInputs.length >= 4) {
                inputSelector = 'input[maxlength="1"]';
                confidence = 0.95;
                isOTPPage = true;
            }

            // Look for inputs with OTP-related names/ids
            const otpInputPatterns = [
                'input[name*="otp"]',
                'input[id*="otp"]',
                'input[name*="code"]',
                'input[id*="code"]',
                'input[name*="verification"]',
                'input[id*="verification"]',
                'input[name*="token"]',
                'input[id*="token"]'
            ];

            for (const pattern of otpInputPatterns) {
                const input = document.querySelector(pattern);
                if (input) {
                    inputSelector = pattern;
                    confidence = Math.max(confidence, 0.8);
                    isOTPPage = true;
                    break;
                }
            }

            // Find submit button
            let submitSelector = '';
            const submitPatterns = [
                'button[type="submit"]',
                'button:contains("Verify")',
                'button:contains("Confirm")',
                'button:contains("Submit")',
                'input[type="submit"]'
            ];

            for (const pattern of submitPatterns) {
                try {
                    const btn = document.querySelector(pattern);
                    if (btn) {
                        submitSelector = pattern;
                        break;
                    }
                } catch { }
            }

            // Fallback: look for any button with verify/confirm text
            if (!submitSelector) {
                const buttons = document.querySelectorAll('button');
                for (const btn of buttons) {
                    const text = btn.textContent?.toLowerCase() || '';
                    if (text.includes('verify') || text.includes('confirm') || text.includes('submit') || text.includes('continue')) {
                        if (btn.id) {
                            submitSelector = `#${btn.id}`;
                        } else {
                            submitSelector = 'button[type="submit"]';
                        }
                        break;
                    }
                }
            }

            // Generate message based on OTP type
            let message = 'Please enter the verification code';
            if (otpType === 'sms') {
                message = 'Please enter the verification code sent to your phone';
            } else if (otpType === 'email') {
                message = 'Please enter the verification code sent to your email';
            } else if (otpType === 'authenticator') {
                message = 'Please enter the code from your authenticator app';
            }

            return {
                isOTPPage,
                otpType,
                inputSelector,
                submitSelector,
                message,
                confidence: isOTPPage ? confidence : 0
            };
        });

        return result as OTPDetectionResult;
    }

    /**
     * Create an OTP request and wait for user input
     */
    async requestOTP(
        sessionId: string,
        companyId: string,
        systemUrl: string,
        systemName: string,
        detection: OTPDetectionResult,
        timeoutMs: number = this.DEFAULT_TIMEOUT
    ): Promise<OTPRequest> {
        const request: OTPRequest = {
            id: `otp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            sessionId,
            companyId,
            systemUrl,
            systemName,
            otpType: detection.otpType,
            inputSelector: detection.inputSelector,
            submitSelector: detection.submitSelector,
            message: detection.message,
            createdAt: Date.now(),
            expiresAt: Date.now() + timeoutMs,
            status: 'pending'
        };

        this.pendingRequests.set(request.id, request);

        // Emit event for UI to show notification
        this.emit('otp_required', request);

        console.log(`🔐 OTP required for ${systemName}: ${request.id}`);

        return request;
    }

    /**
     * Wait for OTP to be provided by user
     */
    async waitForOTP(requestId: string, pollIntervalMs: number = 1000): Promise<string | null> {
        const request = this.pendingRequests.get(requestId);
        if (!request) {
            throw new Error(`OTP request ${requestId} not found`);
        }

        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const current = this.pendingRequests.get(requestId);

                if (!current) {
                    clearInterval(checkInterval);
                    resolve(null);
                    return;
                }

                // Check if OTP received
                if (current.status === 'received' && current.otpValue) {
                    clearInterval(checkInterval);
                    current.status = 'submitted';
                    this.pendingRequests.set(requestId, current);
                    console.log(`✅ OTP received for ${requestId}`);
                    resolve(current.otpValue);
                    return;
                }

                // Check if cancelled
                if (current.status === 'cancelled') {
                    clearInterval(checkInterval);
                    console.log(`❌ OTP cancelled for ${requestId}`);
                    resolve(null);
                    return;
                }

                // Check if expired
                if (Date.now() > current.expiresAt) {
                    clearInterval(checkInterval);
                    current.status = 'expired';
                    this.pendingRequests.set(requestId, current);
                    this.emit('otp_expired', current);
                    console.log(`⏰ OTP expired for ${requestId}`);
                    resolve(null);
                    return;
                }
            }, pollIntervalMs);
        });
    }

    /**
     * Submit OTP value (called by UI)
     */
    submitOTP(requestId: string, otpValue: string): boolean {
        const request = this.pendingRequests.get(requestId);
        if (!request) {
            return false;
        }

        request.otpValue = otpValue;
        request.status = 'received';
        this.pendingRequests.set(requestId, request);

        this.emit('otp_submitted', request);
        return true;
    }

    /**
     * Cancel OTP request
     */
    cancelOTP(requestId: string): boolean {
        const request = this.pendingRequests.get(requestId);
        if (!request) {
            return false;
        }

        request.status = 'cancelled';
        this.pendingRequests.set(requestId, request);

        this.emit('otp_cancelled', request);
        return true;
    }

    /**
     * Get pending OTP requests for a company
     */
    getPendingRequests(companyId: string): OTPRequest[] {
        return Array.from(this.pendingRequests.values())
            .filter(r => r.companyId === companyId && r.status === 'pending');
    }

    /**
     * Get specific OTP request
     */
    getRequest(requestId: string): OTPRequest | undefined {
        return this.pendingRequests.get(requestId);
    }

    /**
     * Enter OTP on the page and submit
     */
    async enterOTP(page: Page, otp: string, detection: OTPDetectionResult): Promise<boolean> {
        try {
            // Check if it's multiple single-digit inputs
            const singleDigitInputs = await page.$$('input[maxlength="1"]');

            if (singleDigitInputs.length >= 4 && otp.length === singleDigitInputs.length) {
                // Enter each digit in separate input
                for (let i = 0; i < otp.length; i++) {
                    await singleDigitInputs[i].fill(otp[i]);
                    await page.waitForTimeout(100);
                }
            } else if (detection.inputSelector) {
                // Single input field
                await page.fill(detection.inputSelector, otp);
            } else {
                throw new Error('Could not find OTP input field');
            }

            // Click submit if available
            if (detection.submitSelector) {
                await page.waitForTimeout(500);
                await page.click(detection.submitSelector);
            }

            // Wait for navigation or response
            await page.waitForTimeout(2000);

            return true;
        } catch (error: any) {
            console.error('Failed to enter OTP:', error.message);
            return false;
        }
    }

    /**
     * Cleanup expired requests
     */
    cleanup(): void {
        const now = Date.now();
        for (const [id, request] of Array.from(this.pendingRequests.entries())) {
            if (request.status === 'pending' && now > request.expiresAt) {
                request.status = 'expired';
                this.pendingRequests.delete(id);
            }
            // Remove old completed/cancelled requests
            if (['submitted', 'cancelled', 'expired'].includes(request.status)) {
                if (now - request.createdAt > 60 * 60 * 1000) { // 1 hour
                    this.pendingRequests.delete(id);
                }
            }
        }
    }
}

// Singleton instance
export const otpHandler = new OTPHandler();

// Cleanup interval
setInterval(() => otpHandler.cleanup(), 60 * 1000);
