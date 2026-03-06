export interface User {
    userId: string;
    email: string;
    inUse: number;
    overdue: number;
    role: string;
}

export enum UserRole {
    customer = 'customer',
    admin = 'admin',
    volunteer = 'volunteer',
}

export type Transaction = {
    id: string;
    qid: string;
    dishType: string;
    transactionType: string;
    userEmail: string;
    timestamp: string;
};

export enum TransactionType {
    BORROWED = 'borrowed',
    RETURNED = 'returned',
}
