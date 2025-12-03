import { database } from '../firebase/client';
import { ref, get, set, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';

/**
 * Generic Firebase CRUD service
 * Provides reusable methods for any data type
 */
export const dataService = {
    /**
     * Get all items for a company
     */
    async getAll<T>(companyId: string, collection: string): Promise<T[]> {
        const dataRef = ref(database, `companies/${companyId}/${collection}`);
        const snapshot = await get(dataRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        return [];
    },

    /**
     * Get a single item by ID
     */
    async getById<T>(companyId: string, collection: string, id: string): Promise<T | null> {
        const itemRef = ref(database, `companies/${companyId}/${collection}/${id}`);
        const snapshot = await get(itemRef);

        if (snapshot.exists()) {
            return { id, ...snapshot.val() } as T;
        }
        return null;
    },

    /**
     * Create a new item
     */
    async create<T>(companyId: string, collection: string, data: Partial<T>): Promise<string> {
        const collectionRef = ref(database, `companies/${companyId}/${collection}`);
        const newItemRef = push(collectionRef);

        await set(newItemRef, {
            ...data,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        return newItemRef.key!;
    },

    /**
     * Update an existing item
     */
    async update<T>(companyId: string, collection: string, id: string, data: Partial<T>): Promise<void> {
        const itemRef = ref(database, `companies/${companyId}/${collection}/${id}`);

        await update(itemRef, {
            ...data,
            updatedAt: Date.now()
        });
    },

    /**
     * Delete an item
     */
    async delete(companyId: string, collection: string, id: string): Promise<void> {
        const itemRef = ref(database, `companies/${companyId}/${collection}/${id}`);
        await remove(itemRef);
    },

    /**
     * Query items by a field value
     */
    async queryByField<T>(
        companyId: string,
        collection: string,
        field: string,
        value: any
    ): Promise<T[]> {
        const collectionRef = ref(database, `companies/${companyId}/${collection}`);
        const dataQuery = query(collectionRef, orderByChild(field), equalTo(value));
        const snapshot = await get(dataQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        return [];
    }
};
