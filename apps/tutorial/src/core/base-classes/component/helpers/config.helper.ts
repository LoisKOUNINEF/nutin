export class ConfigHelper {
  public static normalize<T extends Record<string, any>>(
    config: T, 
    defaults: Partial<T>
  ): T {
    return {
      ...defaults,
      ...config
    } as T;
  }

  public static normalizeStrings<T extends Record<string, any>>(
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
  
  public static createNormalizedTemplate<T extends Record<string, any>>({
    config, 
    defaults = {}, 
    normalizeKeys = [], 
    templateFn = () => ''
  }: T) {
    let normalizedConfig = ConfigHelper.normalize(config, defaults);
    normalizedConfig = ConfigHelper.normalizeStrings(normalizedConfig, normalizeKeys);
    return templateFn(normalizedConfig);
  }

  public static setConfigValue<T extends Record<string, any>>(config: T, normalizeKeys: (keyof T)[]): T {
    if (normalizeKeys) return ConfigHelper.normalizeStrings(config, normalizeKeys) as T;
    else if (config) return config as T 
    else return ({} as T);
  }
}
