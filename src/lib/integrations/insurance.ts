// src/lib/integrations/insurance.ts

/**
 * Integration Layer - Core Insurance Software
 * Supports policy management, claims, underwriting
 */

export interface InsuranceConfig {
    apiUrl: string;
    apiKey: string;
    companyCode: string;
    environment: 'sandbox' | 'production';
}

export interface Policy {
    policyNumber: string;
    policyHolderName: string;
    policyType: 'life' | 'health' | 'auto' | 'property' | 'travel';
    status: 'active' | 'lapsed' | 'cancelled' | 'expired';
    startDate: string;
    endDate: string;
    premium: number;
    coverageAmount: number;
    currency: string;
    beneficiaries?: Array<{ name: string; relationship: string; percentage: number }>;
}

export interface Claim {
    claimNumber: string;
    policyNumber: string;
    claimType: string;
    claimDate: string;
    claimAmount: number;
    status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
    description: string;
    documents?: string[];
    assessorNotes?: string;
}

export interface QuoteRequest {
    policyType: 'life' | 'health' | 'auto' | 'property' | 'travel';
    coverageAmount: number;
    customerAge?: number;
    vehicleValue?: number;
    propertyValue?: number;
    travelDuration?: number;
    customerId: string;
}

export interface Quote {
    quoteId: string;
    policyType: string;
    premium: number;
    coverageAmount: number;
    validUntil: string;
    terms: string[];
    exclusions: string[];
}

/**
 * Core Insurance System Client
 */
export class InsuranceClient {
    private config: InsuranceConfig;

    constructor(config: InsuranceConfig) {
        this.config = config;
    }

    /**
     * Get policy details
     */
    async getPolicy(policyNumber: string): Promise<Policy> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/policies/${policyNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'X-Company-Code': this.config.companyCode,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Policy query failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                policyNumber: data.policy_number || policyNumber,
                policyHolderName: data.policyholder_name || data.customer_name,
                policyType: data.policy_type || data.type,
                status: data.status || 'active',
                startDate: data.start_date || data.effective_date,
                endDate: data.end_date || data.expiry_date,
                premium: parseFloat(data.premium || '0'),
                coverageAmount: parseFloat(data.coverage_amount || data.sum_assured || '0'),
                currency: data.currency || 'ZMW',
                beneficiaries: data.beneficiaries,
            };
        } catch (error) {
            throw new Error(`Failed to fetch policy: ${error}`);
        }
    }

    /**
     * Get customer policies
     */
    async getCustomerPolicies(customerId: string): Promise<Policy[]> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/customers/${customerId}/policies`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'X-Company-Code': this.config.companyCode,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Customer policies query failed: ${response.statusText}`);
            }

            const data = await response.json();
            const policies = data.policies || data.data || [];

            return policies.map((policy: any) => ({
                policyNumber: policy.policy_number,
                policyHolderName: policy.policyholder_name,
                policyType: policy.policy_type,
                status: policy.status,
                startDate: policy.start_date,
                endDate: policy.end_date,
                premium: parseFloat(policy.premium),
                coverageAmount: parseFloat(policy.coverage_amount),
                currency: policy.currency || 'ZMW',
            }));
        } catch (error) {
            throw new Error(`Failed to fetch customer policies: ${error}`);
        }
    }

    /**
     * Request insurance quote
     */
    async requestQuote(request: QuoteRequest): Promise<Quote> {
        try {
            const response = await fetch(`${this.config.apiUrl}/quotes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Company-Code': this.config.companyCode,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    policy_type: request.policyType,
                    coverage_amount: request.coverageAmount,
                    customer_id: request.customerId,
                    customer_age: request.customerAge,
                    vehicle_value: request.vehicleValue,
                    property_value: request.propertyValue,
                    travel_duration: request.travelDuration,
                }),
            });

            if (!response.ok) {
                throw new Error(`Quote request failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                quoteId: data.quote_id || data.id,
                policyType: data.policy_type,
                premium: parseFloat(data.premium || data.monthly_premium || '0'),
                coverageAmount: parseFloat(data.coverage_amount),
                validUntil: data.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                terms: data.terms || [],
                exclusions: data.exclusions || [],
            };
        } catch (error) {
            throw new Error(`Failed to request quote: ${error}`);
        }
    }

    /**
     * Submit claim
     */
    async submitClaim(
        policyNumber: string,
        claimType: string,
        claimAmount: number,
        description: string,
        documents: string[]
    ): Promise<Claim> {
        try {
            const claimNumber = `CLM${Date.now()}`;

            const response = await fetch(`${this.config.apiUrl}/claims`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Company-Code': this.config.companyCode,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    policy_number: policyNumber,
                    claim_type: claimType,
                    claim_amount: claimAmount,
                    description,
                    documents,
                    claim_date: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(`Claim submission failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                claimNumber: data.claim_number || claimNumber,
                policyNumber,
                claimType,
                claimDate: data.claim_date || new Date().toISOString(),
                claimAmount,
                status: data.status || 'submitted',
                description,
                documents,
            };
        } catch (error) {
            throw new Error(`Failed to submit claim: ${error}`);
        }
    }

    /**
     * Get claim status
     */
    async getClaimStatus(claimNumber: string): Promise<Claim> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/claims/${claimNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'X-Company-Code': this.config.companyCode,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Claim query failed: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                claimNumber: data.claim_number || claimNumber,
                policyNumber: data.policy_number,
                claimType: data.claim_type,
                claimDate: data.claim_date,
                claimAmount: parseFloat(data.claim_amount),
                status: data.status,
                description: data.description,
                documents: data.documents,
                assessorNotes: data.assessor_notes || data.notes,
            };
        } catch (error) {
            throw new Error(`Failed to fetch claim status: ${error}`);
        }
    }

    /**
     * Upload claim document
     */
    async uploadDocument(
        claimNumber: string,
        documentType: string,
        fileData: Buffer | Blob,
        fileName: string
    ): Promise<{ success: boolean; documentId?: string; message: string }> {
        try {
            const formData = new FormData();
            const blob = fileData instanceof Blob ? fileData : new Blob([new Uint8Array(fileData)]);
            formData.append('file', blob, fileName);
            formData.append('claim_number', claimNumber);
            formData.append('document_type', documentType);

            const response = await fetch(`${this.config.apiUrl}/claims/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Company-Code': this.config.companyCode,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Document upload failed');
            }

            const data = await response.json();

            return {
                success: true,
                documentId: data.document_id,
                message: 'Document uploaded successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    }

    /**
     * Renew policy
     */
    async renewPolicy(
        policyNumber: string
    ): Promise<{ success: boolean; newPolicyNumber?: string; message: string }> {
        try {
            const response = await fetch(`${this.config.apiUrl}/policies/${policyNumber}/renew`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'X-Company-Code': this.config.companyCode,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Policy renewal failed');
            }

            const data = await response.json();

            return {
                success: true,
                newPolicyNumber: data.new_policy_number || policyNumber,
                message: 'Policy renewed successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Renewal failed',
            };
        }
    }

    /**
     * Update beneficiaries
     */
    async updateBeneficiaries(
        policyNumber: string,
        beneficiaries: Array<{ name: string; relationship: string; percentage: number }>
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/policies/${policyNumber}/beneficiaries`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'X-Company-Code': this.config.companyCode,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ beneficiaries }),
                }
            );

            if (!response.ok) {
                throw new Error('Beneficiary update failed');
            }

            return {
                success: true,
                message: 'Beneficiaries updated successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Update failed',
            };
        }
    }
}
