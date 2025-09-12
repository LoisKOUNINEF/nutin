export const normalizeString = (str: string) => str.replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
