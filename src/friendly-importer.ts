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
    };

export async function friendlyImport<A>(
  sourceDir: string,
  name: string
): Promise<ImportFunctionResult<A>> {
  try {
    const imported: { [k: string]: A } = await import(sourceDir); // does this need some caching ?
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
  } catch {
    return {
      status: 'import failed',
    };
  }
}
