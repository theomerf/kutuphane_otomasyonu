export const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
};