import { isSerializableShallow } from "../utils";
import { Environment, IResolver, Message, MessageType, StatusCode } from "./model";
import { buildMessage, IBase, IResolverRequest, prepareMessageForResponse } from "./internal-model";
import { RequestController } from "./request-controller";
import { SubscriberStore } from "./pubsub/subscriber-store";
import { PublisherStore } from "./pubsub/publisher-store";
import { PublisherResolver } from "./pubsub/publiser-resolver";
import { SubscriberResolver } from "./pubsub/subscriber-resolver";

export class Base implements IBase {
    private resolvers: Map<string, IResolver>;
    private subscriberStore: SubscriberStore;
    private publisherStore: PublisherStore;
    protected self: Environment;
    protected rc: RequestController;

    constructor(self: Environment) {
        this.self = self;

        this.incomingMessageHandler = this.incomingMessageHandler.bind(this);
        this.rc = new RequestController(this.incomingMessageHandler);
        this.subscriberStore = new SubscriberStore(this);
        this.publisherStore = new PublisherStore(this);
        this.resolvers = new Map<string, IResolver>();

        const publisherResolver = new PublisherResolver(this.publisherStore);
        this.resolvers.set(publisherResolver.name, publisherResolver);

        const subscriberResolver = new SubscriberResolver(this.subscriberStore);
        this.resolvers.set(subscriberResolver.name, subscriberResolver);
    }

    protected async incomingMessageHandler(message: Message): Promise<void> {
        if (!message || message.type !== MessageType.MESSAGING) return;

        // deal with real message
        if (!message.request) {
            const predMessage = buildErrorResponse(
                message, "invalid request format, expecting an IResolverRequest", StatusCode.BadRequest)
            await this.sendMessage(predMessage);
            return;
        }

        const resolverReq = message.request as IResolverRequest;
        const resolver = this.resolvers.get(resolverReq.name);
        if (!resolver) {
            const predMessage = buildErrorResponse(
                message, `missing resolver ${resolverReq.name}`, StatusCode.BadRequest)
            await this.sendMessage(predMessage);
            return;
        }

        const event = (resolver as any)[resolverReq.event]
        if (!event) {
            const predMessage = buildErrorResponse(
                message, `missing event ${resolverReq.event} in resolver ${resolverReq.name}`, StatusCode.BadRequest)
            await this.sendMessage(predMessage);
            return;
        }

        try {
            const eventResult = await event.apply(resolver, [resolverReq.inputs, message.from]);
            message.response = { status: StatusCode.OK, body: eventResult };
            const predMessage = prepareMessageForResponse(message);
            await this.sendMessage(predMessage);
        } catch (err: any) {
            const predMessage = buildErrorResponse(
                message,
                `failed to call event ${resolverReq.event} from resolver ${resolverReq.name}: ${err.message} > ${err.stack || ""}`,
                StatusCode.InternalServerError
            )
            await this.sendMessage(predMessage);
            return;
        }
    }

    private sendMessage(message: Message): Promise<Message> {
        if (!isSerializableShallow(message)) {
            throw Error("'message' param is not serializable.");
        }

        return this.rc.sendMessage(message);
    }

    public async invokeResolver<T>(resolverName: string, eventName: string, inputs: any): Promise<T> {
        const req: IResolverRequest = {
            name: resolverName,
            event: eventName,
            inputs: inputs,
        };
        const message = buildMessage(req, MessageType.MESSAGING, this.self.origin, "");
        const returnMessage = await this.sendMessage(message);
        if (!returnMessage.response) {
            throw new Error("failed to invoke resolver, inputs: " + JSON.stringify(inputs || {}));
        }

        if (returnMessage.response.status !== StatusCode.OK) {
            throw new Error(returnMessage.response.error);
        }

        return returnMessage.response.body as any as T;
    }

    public registerResolver(resolver: IResolver): void {
        if (this.resolvers.has(resolver.name)) {
            throw new Error(`resolver '${resolver.name}' already exists`);
        }

        this.resolvers.set(resolver.name, resolver);
    }

    public subscribe(eventName: string, callback: Function): Promise<void> {
        return this.subscriberStore.subscribe(eventName, callback);
    }

    public unsubscribe(eventName: string, callback: Function): Promise<void> {
        return this.subscriberStore.unsubscribe(eventName, callback);
    }

    public broadcastEvent(eventName: string, payload: any): Promise<void> {
        return this.publisherStore.broadcastEvent(eventName, payload);
    }

    public dispose(): void {
        this.rc.dispose();
    }
}

const buildErrorResponse = (message: Message, error: string, status: StatusCode): Message => {
    message.response = { status, error };
    return prepareMessageForResponse(message);
}