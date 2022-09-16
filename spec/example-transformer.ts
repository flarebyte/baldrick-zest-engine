import { abstractObject, mutatorRules } from 'object-crumble';
export const addPrefix1 = (value: string, prefix: string) =>
  `${prefix}${value}`;

export const addPrefix2 = (prefix: string, value: string) =>
  `${prefix}${value}`;

export const addPrefix3 = (prefix: string) => (value: string | object) =>
  `${prefix}${value}`;

export const makeUpperCase = (value: string | object) => {
  if (typeof value === 'string') {
    return value.toUpperCase();
  } else {
    return {
      error: 'Transformer: only string can be converted to uppercase',
      value,
    };
  }
};

export const simpleAbstract = (value: string | object) => {
  if (typeof value === 'string') {
    return {
      kind: 'string',
      size: value.length,
    };
  } else {
    return {
      kind: 'object',
      keys: Object.keys(value),
    };
  }
};

export const crumbleAbstractor = (value: object): object[] =>
  abstractObject([])(value);

export class PrefixA {
  static addPrefix4(prefix: string, value: string): string {
    return `${prefix}${value}`;
  }
  static addPrefix5(value: string, prefix: string): string {
    return `${prefix}${value}`;
  }
  static makeUpperCase6(value: string) {
    value.toUpperCase();
  }
}
export class PrefixB {
  prefix: string;
  constructor(prefix: string) {
    this.prefix = prefix;
  }
  withPrefix(value: string) {
    return `${this.prefix}${value}`;
  }
}

export class ValueHolderC {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
  toUpper() {
    return this.value.toUpperCase();
  }
}
