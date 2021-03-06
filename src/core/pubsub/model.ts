export interface Subscription<T> {
    eventName: string;
    payload: T;
}