export type Dish = {
    id: string;
    qid: number;
    type: string;
    status: DishStatus;
    condition?: DishCondition;
    timesBorrowed: number;
    registered: string;
    userId: string | null;
    borrowedAt: string | null;
    location: string | null;
    vendor: string | null;
};

export enum DishStatus {
    borrowed = 'borrowed',
    available = 'available',
    overdue = 'overdue',
    broken = 'broken',
    lost = 'lost',
    unavailable = 'unavailable',
}

export enum DishCondition {
    smallChip = 'small_crack_chip',
    largeCrack = 'large_crack_chunk',
    shattered = 'shattered',
    good = 'good',
}
