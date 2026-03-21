/**
 * Returns a date string in YYYY-MM-DD format based on local time.
 */
export function localDateStr(date = new Date()) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
}
