export interface Subscription<T> {
    event: string;
    payload: T;
}