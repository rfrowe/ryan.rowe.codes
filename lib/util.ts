export const notNull = <T>(value: T | null): value is T => value !== null

export const isNull = <T>(value: T | null): value is null => value === null

export const isString = <T>(value: T | string): value is string => typeof value === 'string'

export const isDefined = <T>(value: T | undefined): value is T => value !== undefined

export const notDefined = <T>(value: T | undefined): value is undefined => value === undefined

export const findDuplicate = <T>(values: T[]): {value: T} | null => {
    const seen = new Set<T>()
    for (const value of values) {
        if (seen.has(value)) {
            return {value}
        }

        seen.add(value)
    }

    return null
}
