# Changelog

## V1.0.1

- Fixed typo issue when using i18n feature

## V1.0.2

- Partially fixed `npm run dev` script when using internal templates. *Page still needs to be reload manually from time to time.*

## V1.1.0

- Added index access in CatalogConfig. Use with `config.index`.
```typescript
interface CatalogItemBase {
  idx: number;
}
type CatalogItemObject<T extends object> = T & CatalogItemBase;
interface CatalogItemPrimitive extends CatalogItemBase {
  value: string | number | boolean | null | undefined;
}

// type safety
type CatalogItemConfig<T = any> =
  T extends object ? CatalogItemObject<T> : CatalogItemPrimitive;
```

**Notes:** *Primitive data arrays (string, number, etc) needs to be accessed with `config.value`.*