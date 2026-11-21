/** Freeze published definitions so JavaScript consumers cannot mutate shared token state. */
export function freeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}

export function kebab(value: string): string {
  const result = value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!result) throw new Error(`Cannot normalize name: ${value}`);
  return result;
}

export function stylePropertyName(key: string, property?: string): string {
  return `--wa11y-style-${key.split('/').map(kebab).join('-')}${property ? `-${kebab(property)}` : ''}`;
}
