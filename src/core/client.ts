import { RequestController } from "./request-controller";
import { Environment, MessageType, readMessageFromEvent, ResponseObject, StatusCode } from "./model";
import { Base } from "./base";

const FREQUENCY_FOR_INIT_HEART_BEAT_SIGNAL_MS = 500; // broadcast every 500 million seconds

export class Client extends Base {

    private isReady: Promise<void>;
    private isReadyResolver: Function | undefined;

    constructor(self: Environment) {
        super(self)
        this.broadcastHeartBeatSignal = this.broadcastHeartBeatSignal.bind(this);
        this.onReceiveInitMessage = this.onReceiveInitMessage.bind(this);

        this.self = self;

        this.rc = new RequestController(this.incomingMessageHandler);
        this.isReady = new Promise<void>(resolver => {
            this.isReadyResolver = resolver;
        });
    }

    public setup(): Promise<void> {
        this.broadcastHeartBeatSignal();
        return this.isReady;
    }

    private onReceiveInitMessage(mEvent: MessageEvent): void {
        const message = readMessageFromEvent(mEvent);

        if (message && message.type === MessageType.INIT) {
            this.rc.setPort(mEvent.ports[0])

            const response: ResponseObject = { status: StatusCode.OK };
            this.rc.responseToMessage(message, response);
            this.isReadyResolver && this.isReadyResolver();
        }
    }

    private broadcastHeartBeatSignal(): void {
        // let parent know we are ready to engage
        if (this.self.parent && this.self.parent.postMessage) {
            this.self.parent.postMessage({ type: MessageType.INIT_HEART_BEAT }, "*");
        }

        setTimeout(() => {
            this.broadcastHeartBeatSignal();
        }, FREQUENCY_FOR_INIT_HEART_BEAT_SIGNAL_MS);
    }
}
