import { AppPipeRegistry } from "../../core/index.js";

export const registerPipes = (): void => {    
  // currency
  AppPipeRegistry.register('currency', (
    value: number, 
    currency = 'USD', 
    locale = 'en-US'
  ) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(Number(value));
  });
    
  // date
  AppPipeRegistry.register('date', (
    value: string | number | Date,
    locale = navigator.language,
    format = 'long',
    time = false,
  ) => {
    const date = new Date(value);
    const formats = {
      short: { year: 'numeric', month: 'short', day: 'numeric', hour: time ? '2-digit' : '', minute: time ? '2-digit' : '' } as Intl.DateTimeFormatOptions,
      long: { year: 'numeric', month: 'long', day: 'numeric', hour: time ? '2-digit' : '', minute: time ? '2-digit' : '' } as Intl.DateTimeFormatOptions,
      time: { hour: '2-digit', minute: '2-digit' } as Intl.DateTimeFormatOptions
    };

    const validFormat = (format in formats ? format : 'long') as keyof typeof formats;

    if (isNaN(date.getTime())) {
      console.warn('Invalid date value in pipe:', value);
      return String(value);
    }

    return date.toLocaleString(locale, formats[validFormat]);
  });

  // number (toFixed)
  AppPipeRegistry.register('number', (value, decimals = 0) => {
    return Number(value).toFixed(parseInt(decimals));
  });

  // string pipes
  AppPipeRegistry.register('uppercase', val => String(val).toUpperCase());
  AppPipeRegistry.register('lowercase', val => String(val).toLowerCase());    
  AppPipeRegistry.register('capitalize', (value) => {
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  });
  AppPipeRegistry.register('capitalizeAll', (value) => {
    const str = String(value);
    return str.replace(/(^|[ .,"'])\s*([a-z])/g, (match, separator, char, offset) => {
    // Don't capitalize if preceded by a single quote (apostrophe)
      if (separator === "'" && offset > 0) return match;
      return separator + char.toUpperCase();
    });
  });
  AppPipeRegistry.register('truncate', (value, length = 50, suffix = '...') => {
    const str = String(value);
    return str.length > parseInt(length) ? str.slice(0, parseInt(length)) + suffix : str;
  });
    
  // utility pipes
  AppPipeRegistry.register('default', (value, defaultValue = '') => {
    return value || defaultValue;
  });
  AppPipeRegistry.register('json', (value) => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  });
}
