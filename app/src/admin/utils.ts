export function capitalizeFirstLetter(value: string): string {
    return value
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function tagColor(text: string): string {
    switch (text) {
        case 'mug':
            return '#496EA5';
        case 'dish':
            return '#68B49A';
        case 'borrowed':
            return '#68B49A';
        case 'returned':
            return '#29604D';
        case 'available':
            return '#29604D';
        case 'overdue':
            return '#BF4949';
        case 'broken':
            return '#BF4949';
        case 'lost':
            return '#BF4949';
        case 'unavailable':
            return '#BF4949';
        default:
            return '';
    }
}

function escapeRegExp(value: string): string {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function searchGrid<T>(
    searchQuery: string,
    allRows: T[],
    setFilteredRows: React.Dispatch<React.SetStateAction<T[]>>,
): void {
    const searchRegex = new RegExp(escapeRegExp(searchQuery), 'i');
    const filteredRows = allRows.filter((row: T) => {
        return Object.keys(row as object).some((field: string) => {
            const rowObj = row as Record<string, unknown>;
            if (field === 'borrowedAt' && rowObj[field]) {
                return searchRegex.test(new Date(rowObj[field] as string).toLocaleString());
            } else if (field === 'registered' && rowObj[field]) {
                return searchRegex.test(new Date(rowObj[field] as string).toLocaleDateString());
            }
            return searchRegex.test((rowObj[field] || '').toString());
        });
    });
    setFilteredRows(filteredRows);
}
