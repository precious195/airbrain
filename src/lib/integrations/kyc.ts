// src/lib/integrations/kyc.ts

/**
 * Integration Layer - KYC (Know Your Customer) Systems
 * Supports identity verification, document validation, compliance checks
 */

export interface KYCConfig {
    provider: 'onfido' | 'trulioo' | 'custom';
    apiUrl: string;
    apiKey: string;
    apiToken?: string;
    region?: string;
}

export interface KYCVerification {
    id: string;
    customerId: string;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'expired';
    verificationLevel: 'basic' | 'intermediate' | 'enhanced';
    submittedAt: string;
    completedAt?: string;
    documents: KYCDocument[];
    checks: KYCCheck[];
    riskScore?: number; // 0-100
    rejectionReasons?: string[];
}

export interface KYCDocument {
    id: string;
    type: 'national_id' | 'passport' | 'drivers_license' | 'proof_of_address' | 'selfie';
    status: 'uploaded' | 'processing' | 'verified' | 'rejected';
    uploadedAt: string;
    verifiedAt?: string;
    fileUrl?: string;
    rejectionReason?: string;
    extractedData?: Record<string, any>;
}

export interface KYCCheck {
    type: 'identity' | 'document' | 'address' | 'watchlist' | 'sanctions' | 'pep';
    status: 'pending' | 'passed' | 'failed' | 'warning';
    result?: string;
    details?: string;
    completedAt?: string;
}

export interface IdentityData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationalId: string;
    address?: {
        street: string;
        city: string;
        province: string;
        country: string;
        postalCode?: string;
    };
    phoneNumber?: string;
    email?: string;
}

/**
 * KYC Client
 */
export class KYCClient {
    private config: KYCConfig;

    constructor(config: KYCConfig) {
        this.config = config;
    }

    /**
     * Create KYC verification session
     */
    async createVerification(
        customerId: string,
        identityData: IdentityData,
        verificationLevel: 'basic' | 'intermediate' | 'enhanced' = 'basic'
    ): Promise<KYCVerification> {
        try {
            const response = await fetch(`${this.config.apiUrl}/verifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_id: customerId,
                    level: verificationLevel,
                    identity: identityData,
                }),
            });

            if (!response.ok) {
                throw new Error('Verification creation failed');
            }

            const data = await response.json();

            return {
                id: data.id || data.verification_id,
                customerId,
                status: 'pending',
                verificationLevel,
                submittedAt: new Date().toISOString(),
                documents: [],
                checks: [],
            };
        } catch (error) {
            throw new Error(`Failed to create verification: ${error}`);
        }
    }

    /**
     * Upload document for verification
     */
    async uploadDocument(
        verificationId: string,
        documentType: KYCDocument['type'],
        fileData: Buffer | Blob,
        fileName: string
    ): Promise<KYCDocument> {
        try {
            const formData = new FormData();
            formData.append('file', fileData, fileName);
            formData.append('type', documentType);
            formData.append('verification_id', verificationId);

            const response = await fetch(`${this.config.apiUrl}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Document upload failed');
            }

            const data = await response.json();

            return {
                id: data.id || data.document_id,
                type: documentType,
                status: 'processing',
                uploadedAt: new Date().toISOString(),
                fileUrl: data.file_url,
            };
        } catch (error) {
            throw new Error(`Failed to upload document: ${error}`);
        }
    }

    /**
     * Get verification status
     */
    async getVerificationStatus(verificationId: string): Promise<KYCVerification> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/verifications/${verificationId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Status check failed');
            }

            const data = await response.json();

            return {
                id: data.id,
                customerId: data.customer_id,
                status: data.status || 'pending',
                verificationLevel: data.level || 'basic',
                submittedAt: data.submitted_at || data.created_at,
                completedAt: data.completed_at,
                documents: data.documents || [],
                checks: data.checks || [],
                riskScore: data.risk_score,
                rejectionReasons: data.rejection_reasons,
            };
        } catch (error) {
            throw new Error(`Failed to get verification status: ${error}`);
        }
    }

    /**
     * Perform identity check
     */
    async performIdentityCheck(
        identityData: IdentityData
    ): Promise<KYCCheck> {
        try {
            const response = await fetch(`${this.config.apiUrl}/checks/identity`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(identityData),
            });

            if (!response.ok) {
                throw new Error('Identity check failed');
            }

            const data = await response.json();

            return {
                type: 'identity',
                status: data.match ? 'passed' : 'failed',
                result: data.match_percentage ? `${data.match_percentage}% match` : undefined,
                details: data.details,
                completedAt: new Date().toISOString(),
            };
        } catch (error) {
            return {
                type: 'identity',
                status: 'failed',
                details: error instanceof Error ? error.message : 'Check failed',
            };
        }
    }

    /**
     * Check against watchlists/sanctions
     */
    async performWatchlistCheck(
        firstName: string,
        lastName: string,
        dateOfBirth: string
    ): Promise<KYCCheck> {
        try {
            const response = await fetch(`${this.config.apiUrl}/checks/watchlist`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    date_of_birth: dateOfBirth,
                }),
            });

            if (!response.ok) {
                throw new Error('Watchlist check failed');
            }

            const data = await response.json();

            return {
                type: 'watchlist',
                status: data.matches && data.matches.length > 0 ? 'warning' : 'passed',
                result: data.matches ? `${data.matches.length} potential matches` : 'No matches',
                details: data.details,
                completedAt: new Date().toISOString(),
            };
        } catch (error) {
            return {
                type: 'watchlist',
                status: 'failed',
                details: error instanceof Error ? error.message : 'Check failed',
            };
        }
    }

    /**
     * Verify address
     */
    async verifyAddress(address: IdentityData['address']): Promise<KYCCheck> {
        try {
            const response = await fetch(`${this.config.apiUrl}/checks/address`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(address),
            });

            if (!response.ok) {
                throw new Error('Address verification failed');
            }

            const data = await response.json();

            return {
                type: 'address',
                status: data.verified ? 'passed' : 'failed',
                result: data.verified ? 'Address verified' : 'Address not verified',
                details: data.details,
                completedAt: new Date().toISOString(),
            };
        } catch (error) {
            return {
                type: 'address',
                status: 'failed',
                details: error instanceof Error ? error.message : 'Verification failed',
            };
        }
    }

    /**
     * Extract data from document (OCR)
     */
    async extractDocumentData(
        documentId: string
    ): Promise<Record<string, any>> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/documents/${documentId}/extract`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Data extraction failed');
            }

            const data = await response.json();

            return {
                firstName: data.first_name,
                lastName: data.last_name,
                dateOfBirth: data.date_of_birth,
                documentNumber: data.document_number,
                expiryDate: data.expiry_date,
                address: data.address,
                ...data.extracted_fields,
            };
        } catch (error) {
            throw new Error(`Failed to extract document data: ${error}`);
        }
    }

    /**
     * Get customer KYC history
     */
    async getCustomerKYCHistory(customerId: string): Promise<KYCVerification[]> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/customers/${customerId}/verifications`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch KYC history');
            }

            const data = await response.json();
            const verifications = data.verifications || data.data || [];

            return verifications.map((v: any) => ({
                id: v.id,
                customerId,
                status: v.status,
                verificationLevel: v.level,
                submittedAt: v.submitted_at,
                completedAt: v.completed_at,
                documents: v.documents || [],
                checks: v.checks || [],
                riskScore: v.risk_score,
            }));
        } catch (error) {
            throw new Error(`Failed to fetch KYC history: ${error}`);
        }
    }

    /**
     * Update verification status (manual review)
     */
    async updateVerificationStatus(
        verificationId: string,
        status: 'approved' | 'rejected',
        notes?: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/verifications/${verificationId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status,
                        notes,
                        reviewed_at: new Date().toISOString(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Status update failed');
            }

            return {
                success: true,
                message: `Verification ${status}`,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Update failed',
            };
        }
    }
}

/**
 * KYC Service
 */
export class KYCService {
    private client: KYCClient;

    constructor(config: KYCConfig) {
        this.client = new KYCClient(config);
    }

    async startVerification(
        customerId: string,
        identityData: IdentityData
    ): Promise<KYCVerification> {
        return this.client.createVerification(customerId, identityData);
    }

    async uploadDocument(
        verificationId: string,
        type: KYCDocument['type'],
        file: Buffer | Blob,
        filename: string
    ): Promise<KYCDocument> {
        return this.client.uploadDocument(verificationId, type, file, filename);
    }

    async checkStatus(verificationId: string): Promise<KYCVerification> {
        return this.client.getVerificationStatus(verificationId);
    }

    async performFullCheck(identityData: IdentityData): Promise<KYCCheck[]> {
        const checks = await Promise.all([
            this.client.performIdentityCheck(identityData),
            this.client.performWatchlistCheck(
                identityData.firstName,
                identityData.lastName,
                identityData.dateOfBirth
            ),
            identityData.address ? this.client.verifyAddress(identityData.address) : null,
        ]);

        return checks.filter(Boolean) as KYCCheck[];
    }
}
