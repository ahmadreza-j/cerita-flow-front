export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fa-IR').format(num);
};

export const parseFormattedNumber = (str: string): number => {
    return parseInt(str.replace(/[^\d]/g, ''), 10);
}; 