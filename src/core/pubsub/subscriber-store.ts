import { IBase } from "../internal-model";
import { Subscription } from "./model";

/**
 * Maintain subscriptions locally and register event to remote.
 * When there are multiple subscribers to the same event, the "many" will only maintain locally,
 * there is always one event register with remote.
 */
export class SubscriberStore {
    private store: Map<string, Function[]>;
    private base: IBase;

    constructor(base: IBase) {
        this.base = base;
        this.store = new Map<string, Function[]>();
    }

    public async subscribe(eventName: string, callback: Function): Promise<void> {
        if (!this.store.has(eventName)) {
            this.store.set(eventName, []);
            // talk to remote and register subscription
            await this.base.invokeResolver<any>("PublisherResolver", "subscribe", eventName)
        }

        const cbList = this.store.get(eventName)!;
        cbList.push(callback);
    }

    public async unsubscribe(eventName: string, callback: Function): Promise<void> {
        const cbList = this.store.get(eventName);
        if (cbList) {
            const idx = cbList.findIndex(cb => cb === callback);
            if (idx >= 0) {
                cbList.splice(idx, 1);
                if (cbList.length === 0) {
                    this.store.delete(eventName);
                    await this.base.invokeResolver<any>("PublisherResolver", "unsubscribe", eventName)
                }
            }
        }

        return Promise.resolve();
    }

    public broadcast(subscription: Subscription<any>): void {
        const cbList = this.store.get(subscription.eventName);
        if (!cbList) return;

        cbList.forEach(cb => {
            try {
                cb.apply(null, [subscription.payload]);
            } catch {
                // ignore error
            }
        });
    }
}