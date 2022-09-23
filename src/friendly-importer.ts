import { ExternalInjection } from "./run-opts-model.js";

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

type ImportFunctionResult<A> =
  | {
      status: 'success';
      component: A;
    }
  | {
      status: 'no component';
      available: string[];
    }
  | {
      status: 'import failed';
      stack?: string;
    };

export async function friendlyImport<A>(
  injection: ExternalInjection,
  sourceDir: string,
  name: string
): Promise<ImportFunctionResult<A>> {
  try {
    const imported: { [k: string]: A } = await injection.io.doImport(sourceDir); // does this need some caching ?
    const component = imported[name];
    return component === undefined
      ? {
          status: 'no component',
          available: Object.keys(imported),
        }
      : {
          status: 'success',
          component,
        };
  } catch(error) {
    return {
      status: 'import failed',
      stack: getErrorStack(error)
    };
  }
}
