// Script to seed Firebase with sample data for all industries
import { database } from '../lib/firebase/client';
import { ref, set } from 'firebase/database';

const companies = [
    { id: 'mobile-company', name: 'Mobile Company', industry: 'mobile' },
    { id: 'banking-company', name: 'Banking Company', industry: 'banking' },
    { id: 'insurance-company', name: 'Insurance Company', industry: 'insurance' },
    { id: 'microfinance-company', name: 'Microfinance Company', industry: 'microfinance' },
    { id: 'television-company', name: 'Television Company', industry: 'television' },
];

// Sample data generators
const generateMobileData = () => ({
    stats: {
        mobile: {
            activeSubscribers: 1250000,
            bundleSalesToday: 3450,
            networkIssues: 12,
            dataUsageTB: 245.8
        }
    },
    bundles: {
        'bundle-1': { id: 'bundle-1', name: 'Daily 1GB', price: 5, dataAmount: '1GB', validity: '24 hours' },
        'bundle-2': { id: 'bundle-2', name: 'Weekly 5GB', price: 20, dataAmount: '5GB', validity: '7 days' },
        'bundle-3': { id: 'bundle-3', name: 'Monthly 20GB', price: 50, dataAmount: '20GB', validity: '30 days' },
        'bundle-4': { id: 'bundle-4', name: 'Unlimited', price: 100, dataAmount: 'Unlimited', validity: '30 days' }
    },
    tickets: {
        'ticket-1': {
            id: 'ticket-1',
            customerId: 'cust-001',
            customerPhone: '+260977123456',
            issue: 'Network connectivity issues',
            status: 'open',
            createdAt: Date.now() - 3600000
        },
        'ticket-2': {
            id: 'ticket-2',
            customerId: 'cust-002',
            customerPhone: '+260966234567',
            issue: 'Unable to purchase bundle',
            status: 'in_progress',
            createdAt: Date.now() - 7200000
        }
    },
    customers: {
        'cust-001': {
            id: 'cust-001',
            name: 'John Mwale',
            phone: '+260977123456',
            email: 'john@example.com',
            status: 'active',
            createdAt: Date.now() - 86400000 * 30
        },
        'cust-002': {
            id: 'cust-002',
            name: 'Sarah Banda',
            phone: '+260966234567',
            email: 'sarah@example.com',
            status: 'active',
            createdAt: Date.now() - 86400000 * 15
        }
    }
});

const generateBankingData = () => ({
    stats: {
        banking: {
            totalAccounts: 500000,
            transactionsToday: 25680,
            fraudAlerts: 8,
            transactionVolume: 12500000
        }
    },
    accountTypes: {
        'acc-1': { id: 'acc-1', name: 'Savings Account', interestRate: 2.5, minBalance: 100, monthlyFee: 5 },
        'acc-2': { id: 'acc-2', name: 'Current Account', interestRate: 0, minBalance: 500, monthlyFee: 10 },
        'acc-3': { id: 'acc-3', name: 'Fixed Deposit', interestRate: 5.0, minBalance: 5000, monthlyFee: 0 }
    },
    tickets: {
        'ticket-1': {
            id: 'ticket-1',
            customerId: 'cust-001',
            customerPhone: '+260977123456',
            issue: 'Card blocked',
            status: 'open',
            createdAt: Date.now() - 3600000
        }
    },
    customers: {
        'cust-001': {
            id: 'cust-001',
            name: 'Michael Phiri',
            phone: '+260977123456',
            email: 'michael@example.com',
            status: 'active',
            createdAt: Date.now() - 86400000 * 60
        }
    }
});

const generateInsuranceData = () => ({
    stats: {
        insurance: {
            activePolicies: 75000,
            claimsToday: 45,
            pendingClaims: 120,
            premiumRevenue: 8500000
        }
    },
    policies: {
        'pol-1': { id: 'pol-1', name: 'Life Insurance', premium: 150, coverage: 50000, term: '10 years' },
        'pol-2': { id: 'pol-2', name: 'Health Insurance', premium: 100, coverage: 25000, term: '1 year' },
        'pol-3': { id: 'pol-3', name: 'Car Insurance', premium: 80, coverage: 15000, term: '1 year' }
    },
    tickets: {
        'ticket-1': {
            id: 'ticket-1',
            customerId: 'cust-001',
            customerPhone: '+260977123456',
            issue: 'Claim status inquiry',
            status: 'in_progress',
            createdAt: Date.now() - 3600000
        }
    },
    customers: {
        'cust-001': {
            id: 'cust-001',
            name: 'Grace Tembo',
            phone: '+260977123456',
            email: 'grace@example.com',
            status: 'active',
            createdAt: Date.now() - 86400000 * 90
        }
    }
});

const generateMicrofinanceData = () => ({
    stats: {
        microfinance: {
            activeLoans: 25000,
            loansDisbursedToday: 45,
            defaultRate: 2.5,
            portfolioValue: 5000000
        }
    },
    loanProducts: {
        'loan-1': { id: 'loan-1', name: 'Micro Loan', maxAmount: 5000, interestRate: 15, term: '6 months' },
        'loan-2': { id: 'loan-2', name: 'SME Loan', maxAmount: 50000, interestRate: 12, term: '2 years' },
        'loan-3': { id: 'loan-3', name: 'Agriculture Loan', maxAmount: 20000, interestRate: 10, term: '1 year' }
    },
    tickets: {
        'ticket-1': {
            id: 'ticket-1',
            customerId: 'cust-001',
            customerPhone: '+260977123456',
            issue: 'Loan application status',
            status: 'open',
            createdAt: Date.now() - 3600000
        }
    },
    customers: {
        'cust-001': {
            id: 'cust-001',
            name: 'Patrick Musonda',
            phone: '+260977123456',
            email: 'patrick@example.com',
            status: 'active',
            createdAt: Date.now() - 86400000 * 45
        }
    }
});

const generateTelevisionData = () => ({
    stats: {
        television: {
            activeSubscribers: 180000,
            newSubscriptionsToday: 125,
            technicalIssues: 18,
            revenue: 2500000
        }
    },
    packages: {
        'pkg-1': { id: 'pkg-1', name: 'Basic Package', price: 50, channels: 50, hd: false },
        'pkg-2': { id: 'pkg-2', name: 'Premium Package', price: 100, channels: 150, hd: true },
        'pkg-3': { id: 'pkg-3', name: 'Sports Package', price: 75, channels: 30, hd: true }
    },
    tickets: {
        'ticket-1': {
            id: 'ticket-1',
            customerId: 'cust-001',
            customerPhone: '+260977123456',
            issue: 'Decoder not working',
            status: 'in_progress',
            createdAt: Date.now() - 3600000
        }
    },
    customers: {
        'cust-001': {
            id: 'cust-001',
            name: 'Alice Mbewe',
            phone: '+260977123456',
            email: 'alice@example.com',
            status: 'active',
            createdAt: Date.now() - 86400000 * 120
        }
    }
});

const dataGenerators: Record<string, () => any> = {
    mobile: generateMobileData,
    banking: generateBankingData,
    insurance: generateInsuranceData,
    microfinance: generateMicrofinanceData,
    television: generateTelevisionData
};

export async function seedFirebaseData() {
    console.log('🌱 Starting Firebase data seeding...');

    for (const company of companies) {
        console.log(`\n📦 Seeding ${company.name}...`);

        const data = dataGenerators[company.industry]();
        const companyRef = ref(database, `companies/${company.id}`);

        try {
            await set(companyRef, data);
            console.log(`✅ ${company.name} seeded successfully`);
        } catch (error) {
            console.error(`❌ Error seeding ${company.name}:`, error);
        }
    }

    console.log('\n🎉 Firebase seeding complete!');
}

// Run if executed directly
if (typeof window !== 'undefined') {
    // Browser environment - export for manual use
    (window as any).seedFirebaseData = seedFirebaseData;
    console.log('💡 Run window.seedFirebaseData() to seed Firebase with sample data');
}
