import { v4 as uuidV4 } from "uuid";
import { deepClone } from "./../utils";

export const REQUEST_LIFE_DURATION: number = 30000; // 30 seconds

export enum MessageSchemaVersion {
    VERSION_0_0_1 = "0.0.1"
}

export enum MessageType {
    INIT = "init",
    INIT_HEART_BEAT = "init_heart_beat",
    MESSAGING = "message",
}

export enum StatusCode {
    OK = "200",
    BadRequest = "400",
    Unauthorized = "401",
    Forbidden = "403",
    NotFound = "404",
    RequestTimeout = "408",
    Conflict = "409",
    InternalServerError = "500",
    ServiceUnavailable = "503",
}

export interface ResponseObject {
    body?: object;
    error?: string;
    status: StatusCode;
}

export interface Message {
    id: string;
    traceId: string;
    type: MessageType;
    from: string;
    to: string;
    exp: Date;
    version: string;
    request?: object;
    response?: ResponseObject;
}

export const buildMessage = (request: object | undefined, mType: MessageType, from: string, to: string): Message => {
    return {
        id: uuidV4(),
        traceId: uuidV4(),
        type: mType,
        from,
        to,
        exp: new Date(Date.now() + REQUEST_LIFE_DURATION),
        version: MessageSchemaVersion.VERSION_0_0_1,
        request,
    };
}

export const prepareMessageForResponse = (message: Message): Message => {
    const clonedMessage = deepClone(message);
    const to = clonedMessage.to;
    clonedMessage.to = clonedMessage.from;
    clonedMessage.from = to;
    return clonedMessage;
}

export interface Environment {
    postMessage: (message: any, to: string, transfer?: any[]) => void;
    origin: string;
    parent: Environment;
    addEventListener: (eventName: string, callback: (event: MessageEvent) => void) => void;
}

export interface RequestKeeperEntry {
    message: Message;
    resolver: (value: Message) => void;
    rejecter: (reason: Message) => void;
    expired: boolean;
}

export const isValidMessage = (message: Message): boolean => {
    if (message
        && typeof message.id === "string"
        && typeof message.traceId === "string"
        && typeof message.type !== "undefined"
        && typeof message.exp !== "undefined"
        && typeof message.version === "string") {

        return true
    }

    return false;
};

export const readMessageFromEvent = (mEvent: MessageEvent): Message | undefined => {
    if (mEvent && isValidMessage(mEvent.data)) {
        return mEvent.data;
    }

    return undefined;
}

export interface IResolver {
    name: string;
}

export interface IResolverRequest {
    name: string;
    event: string;
    inputs: any;
}