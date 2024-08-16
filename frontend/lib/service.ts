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
    public availableModels$ = new BehaviorSubject<any>([]);
    public availableModels: any[]=[];
    public selectedModelId$ = new BehaviorSubject<number>(1);

    constructor() {
    this.start();
    // Inside the ChatService class, update the StreamMessage event handler
    this.connection.on("StreamMessage", (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        const chatId = parsedMessage.ChatId;
        const partialContent = parsedMessage.PartialContent;

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
      }, 2500); // 1000 milliseconds = 1 seconds
    });
    this.connection.on("ChatTitles", (chatTitles: any) => {
      this.chatTitles = [...this.chatTitles, chatTitles];
      this.chatTitles$.next(this.chatTitles);
    });
    this.connection.on("AvailableModels", (availableModels: any) => {
      this.availableModels = availableModels;
      this.availableModels$.next(this.availableModels);

      console.log("Available models updated. Models:", this.availableModels);
    });
    this.connection.on("ClearChatTitles", () => {
      this.chatTitles = [];
      this.chatTitles$.next(this.chatTitles);
    });
  }

    //start connection
    public async start(){
        try {
            await this.connection.start();
            console.log("SignalR Connected.");
        } catch (err) {
            console.log(err);
            setTimeout(() => this.start(), 1000);
        }
    }

    //join chatId
    public async joinChat(userId: string) {
        try{
          console.log("User joined chat:", userId);
          return this.connection.invoke("JoinRoom", { userId });
          
      }catch(err){
        console.error("Error joining chat:", err);
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
          setTimeout(async () => {
            console.log("Reconnecting...");
            await this.start();
            await this.joinChat(userId);
            console.log("Reconnected.");
        }, 500);
        }
      }
    }
    //leave chatId
    public async leaveChat(chatId: string){
        return this.connection.stop();
    }
}