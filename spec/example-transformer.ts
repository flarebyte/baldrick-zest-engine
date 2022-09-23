import { abstractObject, mutateObject, mutatorRules } from 'object-crumble';
import { ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const addPrefix1 = (value: string, prefix: string) =>
  `${prefix}${value}`;

export const addPrefix2 = (prefix: string, value: string) =>
  `${prefix}${value}`;

export const addPrefix3 =
  (config: Record<string, string>) => (value: string | object) =>
    `${config['prefix']}${value}`;

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

export const crumbleMutate =
  (config: Record<string, string>) =>
  (value: object): object =>
    mutateObject(mutatorRules)({
      path: `${config['path']}`,
      kind: 'string',
      mutationName: `${config['mutation']}`,
    })(value);

type CrumbleWrappedFunction = (values: object[]) => object;

export const crumbleTumble =
  (config: Record<string, string>, table: Record<string, string>[]) =>
  (func: CrumbleWrappedFunction, values: object[]): object[] => {
    const signature = config['signature'];
    if (
      signature === undefined ||
      signature !== 'A' ||
      values[0] === undefined
    ) {
      throw new Error('Crumble should have a signature');
    }
    const value = values[0];
    let results = [];
    for (const row of table) {
      const mutated = mutateObject(mutatorRules)({
        path: `${row['path']}`,
        kind: 'string',
        mutationName: `${row['mutation']}`,
      })(value);
      const result = func([mutated]);
      results.push({
        title: `${row['path']} and ${row['mutation']}`,
        result: abstractObject([])(result),
      });
    }
    return results;
  };

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

export const toJSONSchema = (schema: ZodSchema<any>): object => {
  return zodToJsonSchema(schema, 'baldrick-zest-schema');
};
