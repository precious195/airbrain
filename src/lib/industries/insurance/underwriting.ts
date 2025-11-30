// src/lib/industries/insurance/underwriting.ts

/**
 * Insurance module - Underwriting and risk assessment
 */

export interface UnderwritingQuestion {
    id: string;
    category: 'personal' | 'health' | 'property' | 'vehicle' | 'lifestyle';
    question: string;
    type: 'yes_no' | 'multiple_choice' | 'numeric' | 'text';
    options?: string[];
    required: boolean;
    riskFactor: 'low' | 'medium' | 'high';
}

export interface UnderwritingAssessment {
    applicantId: string;
    policyType: 'life' | 'health' | 'auto' | 'property';
    riskRating: 'preferred' | 'standard' | 'substandard' | 'declined';
    premiumAdjustment: number; // percentage
    conditions: string[];
    exclusions: string[];
    approved: boolean;
    reason?: string;
}

/**
 * Get underwriting questions based on policy type
 */
export function getUnderwritingQuestions(
    policyType: 'life' | 'health' | 'auto' | 'property'
): UnderwritingQuestion[] {
    const commonQuestions: UnderwritingQuestion[] = [
        {
            id: 'q_age',
            category: 'personal',
            question: 'What is your age?',
            type: 'numeric',
            required: true,
            riskFactor: 'medium',
        },
        {
            id: 'q_occupation',
            category: 'personal',
            question: 'What is your occupation?',
            type: 'text',
            required: true,
            riskFactor: 'medium',
        },
    ];

    const policySpecificQuestions: Record<string, UnderwritingQuestion[]> = {
        life: [
            {
                id: 'q_smoker',
                category: 'health',
                question: 'Do you smoke or use tobacco products?',
                type: 'yes_no',
                required: true,
                riskFactor: 'high',
            },
            {
                id: 'q_pre_existing',
                category: 'health',
                question: 'Do you have any pre-existing medical conditions? (Diabetes, Heart disease, Cancer, etc.)',
                type: 'yes_no',
                required: true,
                riskFactor: 'high',
            },
            {
                id: 'q_family_history',
                category: 'health',
                question: 'Any family history of serious illness?',
                type: 'yes_no',
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_height_weight',
                category: 'health',
                question: 'What is your height and weight? (For BMI calculation)',
                type: 'text',
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_hazardous_activity',
                category: 'lifestyle',
                question: 'Do you participate in hazardous activities? (Skydiving, racing, etc.)',
                type: 'yes_no',
                required: true,
                riskFactor: 'high',
            },
        ],
        health: [
            {
                id: 'q_chronic_conditions',
                category: 'health',
                question: 'Do you have any chronic medical conditions?',
                type: 'yes_no',
                required: true,
                riskFactor: 'high',
            },
            {
                id: 'q_medications',
                category: 'health',
                question: 'Are you currently on any prescription medications?',
                type: 'yes_no',
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_surgeries',
                category: 'health',
                question: 'Have you had any surgeries in the past 5 years?',
                type: 'yes_no',
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_lifestyle',
                category: 'lifestyle',
                question: 'How would you describe your lifestyle?',
                type: 'multiple_choice',
                options: ['Very Active', 'Active', 'Moderate', 'Sedentary'],
                required: true,
                riskFactor: 'low',
            },
        ],
        auto: [
            {
                id: 'q_vehicle_year',
                category: 'vehicle',
                question: 'What is the year of manufacture?',
                type: 'numeric',
                required: true,
                riskFactor: 'low',
            },
            {
                id: 'q_vehicle_value',
                category: 'vehicle',
                question: 'Current market value of the vehicle?',
                type: 'numeric',
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_driving_history',
                category: 'personal',
                question: 'Any accidents or traffic violations in the past 3 years?',
                type: 'yes_no',
                required: true,
                riskFactor: 'high',
            },
            {
                id: 'q_vehicle_use',
                category: 'vehicle',
                question: 'How is the vehicle primarily used?',
                type: 'multiple_choice',
                options: ['Personal', 'Business', 'Commercial'],
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_security',
                category: 'vehicle',
                question: 'Does the vehicle have a tracker or alarm system?',
                type: 'yes_no',
                required: true,
                riskFactor: 'low',
            },
        ],
        property: [
            {
                id: 'q_property_type',
                category: 'property',
                question: 'Type of property?',
                type: 'multiple_choice',
                options: ['House', 'Apartment', 'Commercial Building', 'Warehouse'],
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_construction',
                category: 'property',
                question: 'What is the main construction material?',
                type: 'multiple_choice',
                options: ['Brick/Concrete', 'Wood', 'Mixed'],
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_security_features',
                category: 'property',
                question: 'Security features installed?',
                type: 'multiple_choice',
                options: ['Alarm System', 'Security Guards', 'CCTV', 'None'],
                required: true,
                riskFactor: 'medium',
            },
            {
                id: 'q_flood_zone',
                category: 'property',
                question: 'Is the property in a flood-prone area?',
                type: 'yes_no',
                required: true,
                riskFactor: 'high',
            },
            {
                id: 'q_previous_claims',
                category: 'property',
                question: 'Any insurance claims in the past 5 years?',
                type: 'yes_no',
                required: true,
                riskFactor: 'high',
            },
        ],
    };

    return [...commonQuestions, ...policySpecificQuestions[policyType]];
}

/**
 * Assess risk based on underwriting answers
 */
export async function assessRisk(
    policyType: 'life' | 'health' | 'auto' | 'property',
    answers: Record<string, any>
): Promise<UnderwritingAssessment> {
    // TODO: Integrate with actuarial system for real risk assessment

    await new Promise((resolve) => setTimeout(resolve, 1000));

    let riskScore = 0;
    const conditions: string[] = [];
    const exclusions: string[] = [];

    // Analyze answers and calculate risk
    if (policyType === 'life') {
        if (answers.q_smoker === 'yes') riskScore += 30;
        if (answers.q_pre_existing === 'yes') {
            riskScore += 40;
            conditions.push('Pre-existing conditions may require medical examination');
        }
        if (answers.q_hazardous_activity === 'yes') {
            riskScore += 20;
            exclusions.push('Deaths during hazardous activities excluded');
        }
        if (parseInt(answers.q_age) > 60) riskScore += 25;
    }

    if (policyType === 'auto') {
        if (answers.q_driving_history === 'yes') {
            riskScore += 35;
            conditions.push('Higher excess required due to driving history');
        }
        if (answers.q_vehicle_use === 'Commercial') riskScore += 20;
        if (answers.q_security === 'yes') riskScore -= 10;
    }

    // Determine rating
    let riskRating: UnderwritingAssessment['riskRating'];
    let premiumAdjustment = 0;
    let approved = true;

    if (riskScore <= 20) {
        riskRating = 'preferred';
        premiumAdjustment = -10; // 10% discount
    } else if (riskScore <= 40) {
        riskRating = 'standard';
        premiumAdjustment = 0;
    } else if (riskScore <= 70) {
        riskRating = 'substandard';
        premiumAdjustment = 25; // 25% loading
        conditions.push('Substandard rating - higher premium applies');
    } else {
        riskRating = 'declined';
        approved = false;
    }

    return {
        applicantId: 'APP' + Date.now(),
        policyType,
        riskRating,
        premiumAdjustment,
        conditions,
        exclusions,
        approved,
        reason: approved ? undefined : 'Risk too high for standard coverage. Please contact underwriting department.',
    };
}

/**
 * Format underwriting assessment
 */
export function formatUnderwritingAssessment(assessment: UnderwritingAssessment): string {
    const ratingEmojis = {
        preferred: '⭐',
        standard: '✅',
        substandard: '⚠️',
        declined: '❌',
    };

    if (!assessment.approved) {
        return `${ratingEmojis.declined} Application Status: DECLINED

${assessment.reason}

What to do next:
• Contact our underwriting team
• Provide additional medical information
• Consider alternative coverage options

Call: +260-XXX-XXXXXX`;
    }

    return `${ratingEmojis[assessment.riskRating]} Underwriting Assessment

Application ID: ${assessment.applicantId}
Risk Rating: ${assessment.riskRating.toUpperCase()}
Status: ${assessment.approved ? 'APPROVED' : 'DECLINED'}

Premium Adjustment: ${assessment.premiumAdjustment > 0 ? '+' : ''}${assessment.premiumAdjustment}%

${assessment.conditions.length > 0 ? `\nConditions:\n${assessment.conditions.map(c => `• ${c}`).join('\n')}` : ''}

${assessment.exclusions.length > 0 ? `\nExclusions:\n${assessment.exclusions.map(e => `• ${e}`).join('\n')}` : ''}

Your application has been approved! Proceed to payment.`;
}
