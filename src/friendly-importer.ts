import { ExternalInjection } from './run-opts-model.js';
import { Result, zestFail, zestOk } from './zest-railway.js';

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

type ImportFunctionResult<A> = Result<
  A,
  {
    message: string;
    stack?: string;
  }
>;

export async function friendlyImport<A>(
  injection: ExternalInjection,
  sourceDir: string,
  name: string
): Promise<ImportFunctionResult<A>> {
  try {
    const imported: { [k: string]: A } = await injection.io.doImport(sourceDir); // does this need some caching ?
    const component = imported[name];
    return component === undefined
      ? zestFail({
          message: `No function with the name ${name} has been found. What about one of these:  ${Object.keys(
            imported
          )}`,
        })
      : zestOk(component);
  } catch (error) {
    return zestFail({
      message: 'The import could not be performed',
      stack: getErrorStack(error),
    });
  }
}
