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
  functionName: string
): Promise<ImportFunctionResult<A>> {
  try {
    const imported: { [k: string]: A } = await import(sourceDir); // does this need some caching ?
    const component = imported[functionName];
    if (component === undefined) {
      return {
        status: 'no component',
        available: Object.keys(imported),
      };
    } else {
      return {
        status: 'success',
        component,
      };
    }
  } catch (error) {
    return {
      status: 'import failed',
    };
  }
}
