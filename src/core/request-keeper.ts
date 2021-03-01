import { Message, RequestKeeperEntry, REQUEST_LIFE_DURATION, StatusCode } from "./model";
import { deepClone } from "./../utils";

export class RequestKeeper {
    private store: Map<string, RequestKeeperEntry>;

    constructor() {
        this.store = new Map<string, RequestKeeperEntry>();
    }

    public add(message: Message): Promise<Message> {
        const id = message.id;
        if (this.store.has(id)) {
            throw new Error(`duplicated message with id ${id}`);
        }

        const promise = new Promise<Message>((resolver, rejecter) => {
            this.store.set(id, { message, resolver, rejecter, expired: false });
            this.expirationCheck(id);
        })

        // https://github.com/nodejs/node/issues/17723
        // promise.catch(() => { });
        return promise;
    }

    public processResponse(message: Message): boolean {
        const id = message.id;
        if (this.store.has(id)) {
            const entry = this.store.get(id)!;

            if (!entry.expired) {
                entry.resolver(message);
            }

            this.store.delete(id);
            return true;
        }

        return false;
    }

    private markRequestTimeout(message: Message): void {
        const id = message.id;
        if (this.store.has(id)) {
            const entry = this.store.get(id)!;
            entry.expired = true;
            entry.resolver(message);
        }
    }

    private expirationCheck(id: string): void {
        setTimeout(
            () => {
                if (this.store.has(id)) {
                    const storeEntry = this.store.get(id)!;
                    const message: Message = deepClone(storeEntry.message);
                    message.response = { error: "request timeout.", status: StatusCode.RequestTimeout };
                    this.markRequestTimeout(message);
                }
            },
            REQUEST_LIFE_DURATION,
        );
    }
}