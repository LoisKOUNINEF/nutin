export function normalize<T extends Record<string, any>>(
  config: T, 
  defaults: Partial<T>
): T {
  return {
    ...defaults,
    ...config
  } as T;
}

export function normalizeStrings<T extends Record<string, any>>(
  config: T,
  stringKeys: (keyof T)[]
): T {
  const normalized = { ...config };
  
  stringKeys.forEach(key => {
    if (normalized[key] === undefined || normalized[key] === null) {
      normalized[key] = '' as T[keyof T];
    }
  });
  
  return normalized;
}

export function createNormalizedTemplate<T extends Record<string, any>>({
  config, 
  defaults = {}, 
  normalizeKeys = [], 
  templateFn = () => ''
}: T) {
  let normalizedConfig = normalize(config, defaults);
  normalizedConfig = normalizeStrings(normalizedConfig, normalizeKeys);
  return templateFn(normalizedConfig);
}

export function setConfigValue<T extends Record<string, any>>(config: T, normalizeKeys: (keyof T)[]): T {
  if (normalizeKeys) return normalizeStrings(config, normalizeKeys) as T;
  else if (config) return config as T 
  else return ({} as T);
}
