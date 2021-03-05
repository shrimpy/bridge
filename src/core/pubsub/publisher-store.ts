import { IBase } from "../internal-model";

export class PublisherStore {
    private store: Set<string>;
    private base: IBase;

    constructor(base: IBase) {
        this.base = base;
        this.store = new Set<string>();
    }

    public subscribe(eventName: string): void {
        if (!this.store.has(eventName)) {
            this.store.add(eventName);
        }
    }

    public unsubscribe(eventName: string): void {
        if (this.store.has(eventName)) {
            this.store.delete(eventName);
        }
    }

    public async broadcastEvent(eventName: string, payload: any): Promise<void> {
        if (this.store.has(eventName)) {
            await this.base.invokeResolver<any>("SubscriberResolver", "broadcast", { payload, eventName })
        }
    }
}