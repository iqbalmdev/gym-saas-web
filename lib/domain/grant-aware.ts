/**
 * A staff read of Client-owned data, which the API may refuse for want of a
 * DataGrant. `not_shared` is a normal outcome to render calmly, not an error —
 * every module that reads Client-owned data speaks this same shape so the UI
 * never has to guess whether a blank panel means "denied" or "still loading".
 */
export type GrantAware<T> = { status: 'ok'; data: T } | { status: 'not_shared' };
