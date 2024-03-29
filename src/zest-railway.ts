interface Success<a> {
  status: 'success';
  value: a;
}
interface Failure<e> {
  status: 'failure';
  error: e;
}

export type Result<a, e> = Success<a> | Failure<e>;

interface fun<a, b> {
  (a: a): b;
}

export const zestOk = <a>(a: a): Success<a> => ({
  status: 'success',
  value: a,
});
export const zestFail = <e>(e: e): Failure<e> => ({
  status: 'failure',
  error: e,
});

export const map =
  <a, b, e>(f: fun<a, b>): fun<Result<a, e>, Result<b, e>> =>
  (r) =>
    r.status == 'success' ? zestOk(f(r.value)) : r;

export const join = <a, e>(r: Result<Result<a, e>, e>): Result<a, e> =>
  r.status == 'failure' ? r : r.value;
