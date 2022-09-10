type TransformerFunction = (value: object | string) => object | string;

type TransformerFunctionWithPrefix = (
  config: string,
  value: object | string
) => object | string;
