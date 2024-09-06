import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export class ChatService {
    public connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl(process.env.NEXT_PUBLIC_BLACKEND_API_URL + "/hub")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

    public msgs$ = new BehaviorSubject<any>([]);
    public msgs: { [chatId: string]: string[] } = {};
    public chatTitles$ = new BehaviorSubject<any>([]);
    public chatTitles: any[]=[];
    public availableModels$ = new BehaviorSubject<any>([]);
    public availableModels: any[]=[];
    public selectedModelId$ = new BehaviorSubject<number>(1);
    public HubConnectionState$ = new BehaviorSubject<string>('');
    public roomJoined$ = new BehaviorSubject<boolean>(false);

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
      }, 500); // 1000 milliseconds = 1 seconds
    });
    this.connection.on("ChatTitles", (chatTitles: any) => {
      this.chatTitles = [...this.chatTitles, chatTitles];
      this.chatTitles$.next(this.chatTitles);
    });
    this.connection.on("AvailableModels", (availableModels: any) => {
      this.availableModels = availableModels;
      this.availableModels$.next(this.availableModels);
    });
    this.connection.on("ClearChatTitles", () => {
      window.localStorage.removeItem("chatTitles");
      this.chatTitles = [];
      this.chatTitles$.next(this.chatTitles);
    });
  }

    //start connection
    public async start(){
        try {
            if (this.connection.state === signalR.HubConnectionState.Disconnected) {
              await this.connection.start()
            .then(() => {
                console.log("SignalR Connected.");
                this.HubConnectionState$.next("Connected"); // Set the HubConnectionState to "Connected";
                if(typeof window !== 'undefined' && window.localStorage.getItem('userId')){
                  this.connection.invoke("JoinRoom", { userId: window.localStorage.getItem('userId') });
                  this.roomJoined$.next(true);
                  console.log("User joined successfully.", window.localStorage.getItem('userId'));
                }
            });
            }
        } catch (err) {
            console.log(err);
        }
    }
    //reconnect
    public async reconnect(){
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
          await this.stop();
          await this.start();
          console.log("Reconnected successfully.");
        }
    }

    //stop connection
    public async stop(){
        this.connection.stop();
        this.HubConnectionState$.next("Disconnected"); // Set the HubConnectionState to "Disconnected";
        this.roomJoined$.next(false);
        console.log("SignalR Disconnected.");
    }

    //join chatId
    public async joinChat(userId: string) {
        try{
          if (this.connection.state === signalR.HubConnectionState.Connected) {
            this.connection.invoke("JoinRoom", { userId });
            this.roomJoined$.next(true);
            console.log("User joined successfully with joinChat function.", userId);

        } else {
            console.error("Connection is not in the 'Connected' state. Cannot join chat.");
        }
      }catch(err){
        console.error("Error joining chat:", err);
        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
          setTimeout(async () => {
            await this.start();
            await this.joinChat(userId);
            this.roomJoined$.next(true);
            console.log("Reconnected after error. joinChat function.", userId);
        }, 500);
        }
      }
    }
    //leave chatId
    public async leaveChat(chatId: string){
        return this.connection.stop();
    }
}