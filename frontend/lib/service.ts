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
    public msgs: { [chatId: string]: string[] } = {};
    public chatTitles$ = new BehaviorSubject<any>([]);
    public chatTitles: any[]=[];

    constructor() {
    this.start();
    // Inside the ChatService class, update the StreamMessage event handler
    this.connection.on("StreamMessage", (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        const chatId = parsedMessage.ChatId;
        const partialContent = parsedMessage.PartialContent;

        // Assuming msgs is an object where keys are chatIds and values are arrays of messages
        if (!this.msgs[chatId]) {
          this.msgs[chatId] = [];
        }
        // Add the partialContent to the chatId array
        this.msgs[chatId].push(partialContent);
        this.msgs$.next(this.msgs);
      } catch (error) {
        console.error("Error parsing StreamMessage:", error);
      }
    });
    this.connection.on("EndStream", () => {
      setTimeout(() => {
        this.msgs = {};
        this.msgs$.next(this.msgs);
        console.log("Stream ended, msgs cleared.");
      }, 2500); // 1000 milliseconds = 1 seconds
    });
    this.connection.on("ChatTitles", (chatTitles: any) => {
      this.chatTitles = [...this.chatTitles, chatTitles];
      this.chatTitles$.next(this.chatTitles);
    });
    this.connection.on("ClearChatTitles", () => {
      this.chatTitles = [];
      this.chatTitles$.next(this.chatTitles);
      console.log("Chat titles cleared.");
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
    public async joinChat(userId: string) {
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            return this.connection.invoke("JoinRoom", { userId });
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