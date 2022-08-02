import {useCallback, useState} from "react";

/**
 * React hook which allows for throwing errors from asynchronous code.
 *
 * @example
 * ```ts
 * const throwError = useAsyncError();
 * const foo = async () => { Promise.reject('bar') }
 * foo().catch(throwError)
 * ```
 */
export const useAsyncError = () => {
    const [_, setError] = useState<Error | null>(null);

    return useCallback((e: Error) => {
        setError(() => {throw e})
    }, [setError])
}
