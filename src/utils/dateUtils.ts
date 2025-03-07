import jalaali from 'jalaali-js';

/**
 * Formats a date to Persian (Jalali) format
 * @param date - Date to format
 * @param format - Format string (default: YYYY/MM/DD)
 * @returns Formatted Persian date
 */
export function formatPersianDate(date: Date | string | null, format = 'YYYY/MM/DD'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const { jy, jm, jd } = jalaali.toJalaali(dateObj);
  
  return format
    .replace('YYYY', jy.toString())
    .replace('MM', jm.toString().padStart(2, '0'))
    .replace('DD', jd.toString().padStart(2, '0'));
}

/**
 * Gets current Persian (Jalali) date
 * @param format - Format string (default: YYYY/MM/DD)
 * @returns Current Persian date
 */
export function getCurrentPersianDate(format = 'YYYY/MM/DD'): string {
  return formatPersianDate(new Date(), format);
}

/**
 * Gets current Persian (Jalali) time
 * @returns Current time in HH:MM:SS format
 */
export function getCurrentPersianTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Gets current Persian (Jalali) date and time
 * @returns Object containing date and time
 */
export function getCurrentPersianDateTime(): { date: string; time: string } {
  return {
    date: getCurrentPersianDate(),
    time: getCurrentPersianTime()
  };
}

/**
 * Converts Persian (Jalali) date to Gregorian date
 * @param persianDate - Persian date in format YYYY/MM/DD
 * @returns Gregorian date
 */
export function toGregorianDate(persianDate: string): Date {
  const [jy, jm, jd] = persianDate.split('/').map(Number);
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

/**
 * Gets Persian month name
 * @param month - Month number (1-12)
 * @returns Persian month name
 */
export function getPersianMonthName(month: number): string {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[month - 1] || '';
}

/**
 * Gets Persian day of week name
 * @param date - Date object
 * @returns Persian day of week name
 */
export function getPersianDayOfWeek(date: Date): string {
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  return days[date.getDay()];
}

/**
 * Formats a date to a human-readable Persian format
 * @param date - Date to format
 * @returns Human-readable Persian date
 */
export function formatPersianDateFull(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const { jy, jm, jd } = jalaali.toJalaali(dateObj);
  
  const dayOfWeek = getPersianDayOfWeek(dateObj);
  const monthName = getPersianMonthName(jm);
  
  return `${dayOfWeek} ${jd} ${monthName} ${jy}`;
} 