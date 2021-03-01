import { Environment, Message, MessageType } from "./model";
import { Base } from "./base";

export class Host extends Base {
    private messageChannel: MessageChannel;
    private client: Environment;
    private clientOrigin: string;
    private isClientReady: Promise<void>;
    private clientReadyResolver: Function | undefined;

    constructor(self: Environment, client: Environment, clientOrigin: string) {
        super(self);
        this.onReceiveClientAliveSignal = this.onReceiveClientAliveSignal.bind(this);

        this.client = client;
        this.clientOrigin = clientOrigin;

        this.messageChannel = new MessageChannel();

        this.isClientReady = new Promise(resolver => {
            this.clientReadyResolver = resolver;
        });

        this.rc.setPort(this.messageChannel.port1);
    }

    public async setup(): Promise<void> {
        await this.isClientReady;
        this.rc.sendMessage(
            "",
            this.clientOrigin,
            undefined,
            MessageType.INIT,
            (message: Message) => {
                this.client.postMessage(message, "*", [this.messageChannel.port2]);
            }
        );
    }

    private onReceiveClientAliveSignal(event: MessageEvent): void {
        const message = event.data as Message;
        if (message && message.type === MessageType.INIT_HEART_BEAT && event.origin === this.clientOrigin) {
            this.clientReadyResolver && this.clientReadyResolver();
        }
    }
}
