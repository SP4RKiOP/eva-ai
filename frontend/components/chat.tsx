import React, { useEffect, useState } from 'react';
import Input from './input';
import ChatHistory from './chat-history';
import Sidebar from './sidebar';
import Header from './header';
import ModelSelect from './model-select';
import Greet from './greet';
import {ChatService} from '../lib/service'; 
import { VisibilityProvider } from './VisibilityContext';
import { useSession } from 'next-auth/react';

interface ChatProps {
    chatId?: string;
  }

interface Message {
  role: string;
  text: string;
}
// Create an instance of ChatService
const chatService = new ChatService();

const Chat: React.FC<ChatProps> = ({chatId}) => {
    const { data: session } = useSession();
    const userName = session?.user?.name ?? '';
    const userMail = session?.user?.email ?? '';
    const userImage = session?.user?.image ?? '';
    const [userId, setUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const handleMessageSubmit = async (text: string) => {
        try {
            // Add user's input text as a message in the current chat
            const userMessage: Message = {
                role: 'user',
                text: text
            };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Semantic`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    userInput: text,
                    chatId: chatId
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch response from server');
            }
            const data = await response.text();
        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {

        // Fetch latest chat history
        if(chatId && chatId.length > 0) {
            fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Semantic/convhistory/${chatId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const newMessages: Message[] = data
                        .filter((chat: any) => chat.Role.Label === "assistant" || chat.Role.Label === "user")
                        .map((chat: any) => ({
                            role: chat.Role.Label,
                            text: chat.Content
                        }));
                    setMessages(newMessages);
                }
            })
            .catch(error => console.error('Error fetching chat history:', error));
        }
            
        // Construct the data object to be sent to your API
        const userData = {
            emailId: userMail,
          };
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
          // Send userData to your API endpoint
          fetch(process.env.NEXT_PUBLIC_BLACKEND_API_URL + "/api/Users/UserId", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to send user data to the API");
                }
                return response.text();
            })
            .then((data) => {
                setUserId(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        
        //sessionStorage.setItem('userId', userId ||'');
        chatService.joinChat(userId ||'', chatId ||'');
        chatService.msgs$.subscribe((msgs) => {
            if (msgs && msgs.length > 0) {
                // console.log('msgs:', msgs);
                const newMessage: Message = {
                    role: 'assistant', // Assuming all messages from Redis are from assistant
                    text: msgs.join('')
                };
                setMessages((prevMessages) => {
                    // Check if the last message is from the assistant and update it
                    if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].role === 'assistant') {
                        return prevMessages.slice(0, -1).concat(newMessage);
                    } else {
                        // If the last message is not from the assistant, add the new message
                        return [...prevMessages, newMessage];
                    }
                });
            }
        });
    }, [userId]);
    

    return (
        <VisibilityProvider>
            <div className="relative z-0 flex h-screen w-full overflow-hidden">
                <ChatHistory userId={userId ||''} userName={userName} userImage={userImage} />
                <div className="relative flex-1 flex-col overflow-hidden">
                    <div className='h-screen w-full flex-1 overflow-auto transition-width'>
                        <Sidebar/>
                        <div className="flex h-screen flex-col" role="presentation">
                            <Header /><ModelSelect />
                            <div className="flex-1 h-full max-h-screen overflow-y-auto">
                                {messages.length === 0 ? ( // Conditionally render Greet component
                                    <Greet />
                                ) : (
                                    messages.map((message, index) => (
                                        <div key={index} className='px-4 py-2 justify-center text-base md:gap-6 m-auto'>
                                            <div className='flex flex-1 text-base mx-auto gap-3 md:px-5 lg:px-1 xl:px-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] group'>
                                                <div className='relative flex w-full flex-col'>
                                                    <div className="font-semibold select-none capitalize">{message.role}</div>
                                                    <div className='min-h-[20px] text-message flex flex-col items-start gap-3 whitespace-pre-wrap break-words [.text-message+&]:mt-5 overflow-x-auto'>{message.text}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Input onSubmit={handleMessageSubmit} messagesLength={messages.length}/>
                        </div>
                    </div>
                </div>
            </div>
        </VisibilityProvider>
    );
};

export default Chat;
