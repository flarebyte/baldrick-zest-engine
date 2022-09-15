import { friendlyImport } from './friendly-importer.js';
import { AnyTransformerModel } from './testing-model.js';

type TransformerFunction = (value: object | string) => object | string;
type HigherTransformerFunction = (config: string) => TransformerFunction;

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

const createTransformerFunction = async (transformer: AnyTransformerModel) => {
  if (transformer.style === 'function a') {
    return await friendlyImport<TransformerFunction>(
      transformer.import,
      transformer.function
    );
  } else if (transformer.style === 'string -> function a') {
    const imported = await friendlyImport<HigherTransformerFunction>(
      transformer.import,
      transformer.function
    );
    if (imported.status !== 'success') {
      return imported;
    }
    return {
      status: 'success',
      component: imported.component(transformer.value),
    };
  } else {
    return await friendlyImport<TransformerFunction>(
      transformer.import,
      transformer.function
    );
  }
};

type TransformerResult =
  | {
      status: 'success';
      func: TransformerFunction;
    }
  | {
      status: 'failure';
      message: string;
    };

export const createTransformerFunctions = async (
  transformers: AnyTransformerModel[]
): Promise<TransformerResult> => {
  const importResultList = await Promise.all(
    transformers.map(createTransformerFunction)
  );
  const hasFailure = importResultList.some(
    (importing) => importing.status !== 'success'
  );
  if (hasFailure) {
    return {
      status: 'failure',
      message: 'Some transformers could not be loaded',
    };
  }
  const transformerList = importResultList.map((importing) =>
    importing.status === 'success' ? importing.component : identityTransformer
  );
  const combinedTransformer = reduceTransformer(transformerList);
  return { status: 'success', func: combinedTransformer };
};
