import { v4 as uuidV4 } from "uuid";
import { deepClone } from "./../utils";
import { Message, MessageSchemaVersion, MessageType } from "./model";

export const REQUEST_LIFE_DURATION: number = 30000; // 30 seconds

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

export interface IResolverRequest {
    name: string;
    event: string;
    inputs: any;
}