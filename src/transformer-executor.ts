import { friendlyImport } from './friendly-importer.js';
import { ExternalInjection } from './run-opts-model.js';
import { AnyTransformerModel } from './testing-model.js';
import { Result, zestFail, zestOk } from './zest-railway.js';

type TransformerFunction = (value: object | string) => object | string;
type HigherTransformerFunction = (
  config: Record<string, string>
) => TransformerFunction;

export const identityTransformer: TransformerFunction = (
  value: object | string
) => value;

const getByIndex = (transformers: TransformerFunction[], index: number) =>
  transformers[index] || identityTransformer;

const reduceTransformer = (
  transformers: TransformerFunction[]
): TransformerFunction => {
  const length = transformers.length;
  // Let's keep things basic for now, but we may prefer a loop on
  // the array eventually
  switch (length) {
    case 0:
      return identityTransformer;
    case 1:
      return getByIndex(transformers, 0);
    case 2:
      return (value: object | string) =>
        getByIndex(transformers, 1)(getByIndex(transformers, 0)(value));
    case 3:
      return (value: object | string) =>
        getByIndex(
          transformers,
          2
        )(getByIndex(transformers, 1)(getByIndex(transformers, 0)(value)));
    case 4:
      return (value: object | string) =>
        getByIndex(
          transformers,
          3
        )(
          getByIndex(
            transformers,
            2
          )(getByIndex(transformers, 1)(getByIndex(transformers, 0)(value)))
        );
    case 5:
      return (value: object | string) =>
        getByIndex(
          transformers,
          4
        )(
          getByIndex(
            transformers,
            3
          )(
            getByIndex(
              transformers,
              2
            )(getByIndex(transformers, 1)(getByIndex(transformers, 0)(value)))
          )
        );
    default:
      throw new Error(`Unexpected number of transformers ${length}`);
  }
};

const createTransformerFunction =
  (injection: ExternalInjection) =>
  async (transformer: AnyTransformerModel) => {
    if (transformer.style === 'function a') {
      return await friendlyImport<TransformerFunction>(
        injection,
        transformer.import,
        transformer.function
      );
    } else if (transformer.style === 'config -> function a') {
      const imported = await friendlyImport<HigherTransformerFunction>(
        injection,
        transformer.import,
        transformer.function
      );
      if (imported.status !== 'success') {
        return imported;
      }
      return zestOk(imported.value(transformer.config));
    } else {
      return await friendlyImport<TransformerFunction>(
        injection,
        transformer.import,
        transformer.function
      );
    }
  };

type TransformerResult = Result<TransformerFunction, { message: string }>;

export const createTransformerFunctions = async (
  injection: ExternalInjection,
  transformers: AnyTransformerModel[]
): Promise<TransformerResult> => {
  const importResultList = await Promise.all(
    transformers.map(createTransformerFunction(injection))
  );
  const hasFailure = importResultList.some(
    (importing) => importing.status !== 'success'
  );
  if (hasFailure) {
    return zestFail({
      message: 'Some transformers could not be loaded', // TODO refine message
    });
  }
  const transformerList = importResultList.map((importing) =>
    importing.status === 'success' ? importing.value : identityTransformer
  );
  const combinedTransformer = reduceTransformer(transformerList);
  return zestOk(combinedTransformer);
};
