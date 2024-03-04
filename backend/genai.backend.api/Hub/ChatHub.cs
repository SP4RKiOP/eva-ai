using genai.backend.api.Models;
using Microsoft.AspNetCore.SignalR;

namespace genai.backend.api.Hub
{
    public class ChatHub : Microsoft.AspNetCore.SignalR.Hub
    {
        private readonly IDictionary<string, ChatHubConnection> _connection;
        public ChatHub(IDictionary<string, ChatHubConnection> connection)
        {
            _connection = connection;
        }
        public async Task JoinRoom(ChatHubConnection userConnection)
        {
            if(userConnection.ChatId==null || userConnection.ChatId.Length==0)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName: userConnection.UserId!);
                _connection[Context.ConnectionId] = userConnection;
                Console.WriteLine(value: $"User {userConnection.UserId} has joined chat.");
            }
            else
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName: userConnection.ChatId!);
                _connection[Context.ConnectionId] = userConnection;
                Console.WriteLine(value: $"User {userConnection.UserId} has joined the ChatId {userConnection.ChatId}");
            }
        }

        /*public async Task SendMessage(string chatId, string message)
        {
            if(_connection.TryGetValue(key:Context.ConnectionId, out var userConnection))
            {
                await Clients.Group(groupName:userConnection.ChatId!)
                    .SendAsync(method:"ReceiveMessage", arg1:userConnection.UserId, arg2:chatId, arg3:message);
            } else { }
        }*/

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            if(!_connection.TryGetValue(key:Context.ConnectionId, out var userConnection))
                return base.OnDisconnectedAsync(exception);
            Clients.Group(groupName:userConnection.ChatId!)
                .SendAsync(method:"ReceiveMessage", arg1:$"{userConnection.UserId} has left the chat", arg2: DateTime.Now);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
