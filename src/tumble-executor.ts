import { friendlyImport } from './friendly-importer.js';
import { AnyTumbleFunctionModel } from './testing-model.js';

type TumbleTable = Record<string, string>[];

type WrappedFunction = (values: object[]) => object;

type TumbleWrapper = (func: WrappedFunction, values: object[]) => object;

type TumbleFunction = (
  config: Record<string, string>,
  table: TumbleTable
) => TumbleWrapper;

type TumbleExecutorLoadingResult =
  | {
      status: 'success';
      component: TumbleWrapper;
    }
  | {
      status: 'failure';
      message: string;
    };

export const createTumbleFunction = async (
  model: AnyTumbleFunctionModel
): Promise<TumbleExecutorLoadingResult> => {
  if (model.style === 'config + table -> function') {
    const imported = await friendlyImport<TumbleFunction>(
      model.import,
      model.function
    );
    if (imported.status !== 'success') {
      return {
        status: 'failure',
        message: `Could not import tumble function ${model.function}`
      };
    }
    return {
      status: 'success',
      component: imported.component(model.config, model.table),
    };
  }
  return {
    status: 'failure',
    message: `Unsupported style ${model.style} for tumble function ${model.function}`,
  };
};
