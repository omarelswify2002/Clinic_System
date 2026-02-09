import { format, formatDistance, parseISO } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';

const getDateFnsLocale = (language) => (language === 'ar' ? arSA : enUS);

export const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateWithLocale = (date, formatStr = 'dd MMMM yyyy', language = 'en') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: getDateFnsLocale(language) });
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd MMMM yyyy p');
};

export const formatTime = (date) => {
  return formatDate(date, 'p');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getTodayEnd = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

