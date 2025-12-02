// Knowledge Base Index
import { mobileKnowledgeBase, type MobileKnowledgeBase } from './mobile';
import { bankingKnowledgeBase, type BankingKnowledgeBase } from './banking';
import { insuranceKnowledgeBase, type InsuranceKnowledgeBase } from './insurance';
import { microfinanceKnowledgeBase, type MicrofinanceKnowledgeBase } from './microfinance';
import { televisionKnowledgeBase, type TelevisionKnowledgeBase } from './television';

export type IndustryType = 'mobile' | 'banking' | 'insurance' | 'microfinance' | 'television';

export type KnowledgeBase =
    | MobileKnowledgeBase
    | BankingKnowledgeBase
    | InsuranceKnowledgeBase
    | MicrofinanceKnowledgeBase
    | TelevisionKnowledgeBase;

export const knowledgeBases: Record<IndustryType, KnowledgeBase> = {
    mobile: mobileKnowledgeBase,
    banking: bankingKnowledgeBase,
    insurance: insuranceKnowledgeBase,
    microfinance: microfinanceKnowledgeBase,
    television: televisionKnowledgeBase,
};

export function getKnowledgeBase(industry: IndustryType): KnowledgeBase {
    return knowledgeBases[industry];
}

export function findSolution(industry: IndustryType, issueKey: string): string | null {
    const kb = getKnowledgeBase(industry);
    const issue = (kb.commonIssues as any)[issueKey];
    return issue?.solution || null;
}

export function shouldEscalateIssue(industry: IndustryType, issueKey: string): boolean {
    const kb = getKnowledgeBase(industry);
    const issue = (kb.commonIssues as any)[issueKey];
    return issue?.escalate || false;
}

export {
    mobileKnowledgeBase,
    bankingKnowledgeBase,
    insuranceKnowledgeBase,
    microfinanceKnowledgeBase,
    televisionKnowledgeBase,
};
