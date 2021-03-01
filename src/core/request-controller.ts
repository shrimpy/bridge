import { RequestKeeper } from "./request-keeper";
import { buildMessage, Message, MessageType, prepareMessageForResponse, readMessageFromEvent, ResponseObject } from "./model";

export type MessageHandler = (message: Message) => void;

export class RequestController {
    private requestKeeper: RequestKeeper;
    private port: MessagePort = (undefined) as any;
    private messageHandler: MessageHandler;

    constructor(messageHandler: MessageHandler) {
        this.onMessageReceived.bind(this);
        this.messageHandler = messageHandler;
        this.requestKeeper = new RequestKeeper();
    }

    public setPort(port: MessagePort): void {
        this.port = port;
        this.port.onmessage = this.onMessageReceived;
    }

    public sendMessage(from: string, to: string, req: object | undefined, mType: MessageType, protocolOverride?: (message: Message) => void): Promise<Message> {
        const message = buildMessage(req, mType, from, to);

        if (protocolOverride) {
            protocolOverride(message);
        } else if (this.port) {
            this.port.postMessage(message);
        } else {
            throw new Error("No available way to send message.");
        }

        return this.requestKeeper.add(message);
    }

    public responseToMessage(message: Message, resp: ResponseObject): void {
        if (!this.port) {
            throw new Error("No available way to send message.");
        }

        const predMessage = prepareMessageForResponse(message);
        predMessage.response = resp;
        this.port.postMessage(predMessage);
    }

    public dispose(): void {
        if (this.port && this.port.close) {
            this.port.close();
        }
    }

    private onMessageReceived(mEvent: MessageEvent): void {
        const message = readMessageFromEvent(mEvent);
        if (!message) {
            return;
        }

        if (!this.requestKeeper.processResponse(message) && this.messageHandler) {
            this.messageHandler(message);
        }
    }
}