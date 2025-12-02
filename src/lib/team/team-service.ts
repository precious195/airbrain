import { database, auth } from '../firebase/client';
import { ref, get, set, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { User, UserRole } from '@/types/database';

export const teamService = {
    async getTeamMembers(companyId: string): Promise<User[]> {
        const usersRef = ref(database, 'users');
        const teamQuery = query(usersRef, orderByChild('companyId'), equalTo(companyId));
        const snapshot = await get(teamQuery);

        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        }
        return [];
    },

    async addMember(
        companyId: string,
        adminId: string,
        email: string,
        name: string,
        role: UserRole,
        password?: string // In a real app, we'd use this to create the Auth user via Admin SDK
    ): Promise<User> {
        // 1. Create User Record
        // In a real production app, we would call a Cloud Function here to:
        // a) Create the Firebase Auth user with the provided email/password
        // b) Set custom claims for the role
        // c) Create the database record

        // For this prototype, we'll simulate it by creating a DB record.
        // The user won't be able to actually login with this password until we wire up the Auth creation.

        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser: User = {
            id: userId,
            email,
            displayName: name,
            phone: '',
            role,
            companyId,
            invitedBy: adminId,
            status: 'active', // Directly active since we added them
            createdAt: Date.now()
        };

        const userRef = ref(database, `users/${userId}`);
        await set(userRef, newUser);

        console.log(`[MOCK] Added user ${email} to company ${companyId} with role ${role}`);
        if (password) {
            console.log(`[MOCK] Password set for ${email}`);
        }

        return newUser;
    },

    async updateMemberRole(userId: string, newRole: UserRole) {
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, { role: newRole });
    },

    async removeMember(userId: string) {
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, { status: 'disabled' });
    }
};
