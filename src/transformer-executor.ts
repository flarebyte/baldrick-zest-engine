import { friendlyImport } from './friendly-importer.js';
import { AnyTransformerModel } from './testing-model.js';

type TransformerFunction = (value: object | string) => object | string;

// type TransformerFunctionWithPrefix = (
//   config: string,
//   value: object | string
// ) => object | string;

export const createTransformerFunction = async (
  transformer: AnyTransformerModel
) => {
  if (transformer.style === 'function a') {
    return await friendlyImport<TransformerFunction>(
      transformer.import,
      transformer.function
    );
  } else {
    return await friendlyImport<TransformerFunction>(
      transformer.import,
      transformer.function
    );
  }
};
