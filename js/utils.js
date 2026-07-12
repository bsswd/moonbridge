/**
 * Форматирует число с разделителями тысяч
 */
export function formatDistance(km) {
    return Math.ceil(km).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Случайное число в диапазоне [min, max]
 */
export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Случайный знак: +1 или -1
 */
export function randomSign() {
    return Math.random() < 0.5 ? 1 : -1;
}