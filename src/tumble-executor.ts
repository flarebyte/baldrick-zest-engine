import { TumbleWrapper } from './execution-context-model.js';
import { friendlyImport } from './friendly-importer.js';
import { ExternalInjection } from './run-opts-model.js';
import { AnyTumbleFunctionModel } from './testing-model.js';
import { Result, zestFail, zestOk } from './zest-railway.js';

type TumbleTable = Record<string, string>[];

type TumbleFunction = (
  config: Record<string, string>,
  table: TumbleTable
) => TumbleWrapper;

type TumbleExecutorLoadingResult = Result<TumbleWrapper, { message: string }>;

export const createTumbleFunction = async (
  injection: ExternalInjection,
  model: AnyTumbleFunctionModel
): Promise<TumbleExecutorLoadingResult> => {
  if (model.style === 'config + table -> function') {
    const imported = await friendlyImport<TumbleFunction>(
      injection,
      model.import,
      model.function
    );
    if (imported.status !== 'success') {
      return zestFail({
        message: `Could not import tumble function ${model.function}`,
      });
    }
    return zestOk(imported.value(model.config, model.table));
  }
  return zestFail({
    message: `Unsupported style ${model.style} for tumble function ${model.function}`,
  });
};
