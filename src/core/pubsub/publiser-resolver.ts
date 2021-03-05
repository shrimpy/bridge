import { IResolver } from "../model";
import { PublisherStore } from "./publisher-store";

export class PublisherResolver implements IResolver {
    public name = "PublisherResolver";
    private store: PublisherStore;

    constructor(store: PublisherStore) {
        this.store = store;
    }

    public subscribe(eventName: string) {
        this.store.subscribe(eventName);
    }

    public unsubscribe(eventName: string) {
        this.store.unsubscribe(eventName);
    }
}