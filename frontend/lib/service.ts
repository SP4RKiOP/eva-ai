import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export class ChatService {
    public connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl(process.env.NEXT_PUBLIC_BLACKEND_API_URL + "/chat", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
    
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

    public msgs$ = new BehaviorSubject<any>([]);
    public msgs: any[]=[];

    constructor() {
        this.start();
        this.connection.on("StreamMessage", (message: string) => {
            this.msgs = [...this.msgs,message];
            this.msgs$.next(this.msgs);
            // console.log("Msgs: ", this.msgs);
        })
        this.connection.on("EndStream", () => {
            setTimeout(() => {
                this.msgs = [];
                this.msgs$.next(this.msgs);
                console.log("Stream ended, msgs cleared.");
            }, 2500); // 1000 milliseconds = 1 seconds
        });

    }
    //start connection
    public async start(){
        try {
            await this.connection.start();
            console.log("SignalR Connected.");
        } catch (err) {
            console.log(err);
            setTimeout(() => this.start(), 5000);
        }
    }

    //join chatId
    public async joinChat(userId: string, chatId?: string) {
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            return this.connection.invoke("JoinRoom", { userId, chatId });
        } else {
            console.error("Connection is not in the 'Connected' state. Cannot join chat.");
            // Optionally, you can handle this case differently, e.g., by retrying the connection or notifying the user.
        }
    }
    //leave chatId
    public async leaveChat(chatId: string){
        return this.connection.stop();
    }
}