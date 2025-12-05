import { auth, database } from '../firebase/client';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { User, Company, IndustryType } from '@/types/database';

export interface RegistrationData {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    industry: IndustryType;
}

export const authService = {
    async registerCompany(data: RegistrationData) {
        const { email, password, fullName, companyName, industry } = data;

        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Generate Company ID
        const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 3. Create Company Record
        const companyRef = ref(database, `companies/${companyId}`);
        const newCompany: Company = {
            id: companyId,
            name: companyName,
            industry: industry,
            createdAt: Date.now(),
            settings: {
                onboardingCompleted: false
            }
        };
        await set(companyRef, newCompany);

        // 4. Create User Record
        const userRef = ref(database, `users/${user.uid}`);
        const newUser: User = {
            id: user.uid,
            email: email,
            phone: '', // Optional for admin
            role: 'company_admin',
            companyId: companyId,
            status: 'active',
            createdAt: Date.now(),
            displayName: fullName
        };
        await set(userRef, newUser);

        // 5. Update Auth Profile
        await updateProfile(user, {
            displayName: fullName
        });

        return { user: newUser, company: newCompany };
    },

    async login(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user details from DB to get companyId
        const userSnapshot = await get(ref(database, `users/${user.uid}`));
        if (!userSnapshot.exists()) {
            throw new Error('User profile not found');
        }

        const userData = userSnapshot.val() as User;
        return userData;
    },

    async logout() {
        await firebaseSignOut(auth);
    },

    async getUserProfile(uid: string): Promise<User | null> {
        const userSnapshot = await get(ref(database, `users/${uid}`));
        if (userSnapshot.exists()) {
            return userSnapshot.val() as User;
        }
        return null;
    }
};
