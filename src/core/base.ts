import { isSerializableShallow } from "../utils";
import { buildMessage, Environment, IResolver, IResolverRequest, Message, MessageType, prepareMessageForResponse, StatusCode } from "./model";
import { RequestController } from "./request-controller";

export class Base {
    private resolvers: Map<string, IResolver>;
    protected self: Environment;
    protected rc: RequestController;

    constructor(self: Environment) {
        this.self = self;

        this.incomingMessageHandler = this.incomingMessageHandler.bind(this);
        this.rc = new RequestController(this.incomingMessageHandler);
        this.resolvers = new Map<string, IResolver>();
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
        } catch (err) {
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

        return this.rc.sendMessage(
            this.self.origin, message.to, message, MessageType.MESSAGING);
    }

    public async invokeResolver<T>(resolverName: string, eventName: string, inputs: Object, to: string): Promise<T> {
        const req: IResolverRequest = {
            name: resolverName,
            event: eventName,
            inputs: inputs,
        };
        const message = buildMessage(req, MessageType.MESSAGING, this.self.origin, to || "");
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

    public dispose(): void {
        this.rc.dispose();
    }
}

const buildErrorResponse = (message: Message, error: string, status: StatusCode): Message => {
    message.response = { status, error };
    return prepareMessageForResponse(message);
}