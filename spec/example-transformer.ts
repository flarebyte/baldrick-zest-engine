export const addPrefix1 = (value: string, prefix: string) =>
  `${prefix}${value}`;

export const addPrefix2 = (prefix: string, value: string) =>
  `${prefix}${value}`;

export const addPrefix3 = (prefix: string) => (value: string) =>
  `${prefix}${value}`;

  export class PrefixA {
    static addPrefix4(prefix: string, value: string): string {
      return `${prefix}${value}`;
    }
    static addPrefix5(value: string, prefix: string): string {
      return `${prefix}${value}`;
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
