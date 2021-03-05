
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

export interface Environment {
    postMessage: (message: any, to: string, transfer?: any[]) => void;
    origin: string;
    parent: Environment;
    addEventListener: (eventName: string, callback: (event: MessageEvent) => void) => void;
}

export interface IResolver {
    name: string;
}
