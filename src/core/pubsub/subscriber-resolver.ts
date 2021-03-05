import { IResolver } from "../model";
import { SubscriberStore } from "./subscriber-store";

export class SubscriberResolver implements IResolver {
    public name = "SubscriberResolver";
    private store: SubscriberStore;

    constructor(store: SubscriberStore) {
        this.store = store;
    }

    public subscribe(eventName: string, callback: Function) {
        this.store.subscribe(eventName, callback);
    }

    public unsubscribe(eventName: string, callback: Function) {
        this.store.unsubscribe(eventName, callback);
    }
}