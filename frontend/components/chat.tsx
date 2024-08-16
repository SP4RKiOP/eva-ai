import React, { useEffect, useState} from 'react';
import Input from './input';
import ChatHistory from './chat-history';
import Sidebar from './sidebar';
import Header from './header';
import ModelSelect from './model-select';
import Greet from './greet';
import {ChatService} from '../lib/service'; 
import { VisibilityProvider } from './VisibilityContext';
import {useRouter} from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface ChatProps {
    chatId?: string;
    fName: string;
    lName: string;
    uMail: string;
    uImg: string;
    rtr: ReturnType<typeof useRouter>;
}

interface Message {
  role: string;
  text: string;
  isPlaceholder?: boolean;
}
// Create an instance of ChatService
const chatService = new ChatService();

const Chat: React.FC<ChatProps> = ({chatId, fName, lName, uMail, uImg, rtr}) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
    const handleMessageSubmit = async (text: string) => {
        try {
            // Add user's input text as a message in the current chat
            const userMessage: Message = {
                role: 'user',
                text: text
            };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            // Add a placeholder for the assistant's response
            const placeholderMessage: Message = {
                role: 'assistant',
                text: '',
                isPlaceholder: true
            };
            setMessages((prevMessages) => [...prevMessages, placeholderMessage]);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Semantic`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    modelId: chatService.selectedModelId$.value,
                    userInput: text,
                    chatId: chatId !== undefined ? chatId : currentChatId
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch response from server');
            }
            const newChatId = await response.text();
            if(newChatId!=null && newChatId.length!= 0) {
                setCurrentChatId(newChatId);
                window.history.pushState({}, '', `/c/${newChatId}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const SkeletonLoader = () => (
      
        <div className="mt-1 flex flex-col space-y-2.5 animate-pulse w-fit md:w-[calc(100%-2rem)]">
            <div className="flex items-center w-full">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-40"></div>
                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
            </div>
            <div className="flex items-center w-full ">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
                        <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
            </div>
            <div className="flex items-center w-full max-md:hidden">
                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
                <div className="h-2.5 ms-2 bg-gray-200 rounded-full dark:bg-gray-700 w-80"></div>
                <div className="h-2.5 ms-2 bg-gray-300 rounded-full dark:bg-gray-600 w-full"></div>
            </div>
        </div>

    );
    useEffect(() => {
    // Fetch latest chat history
    if (chatId && chatId.length > 0) {
      fetch(
        `${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Semantic/convhistory/${chatId}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data && data.length > 0) {
            const newMessages: Message[] = data
              .filter(
                (chat: any) =>
                  chat.Role.Label === "assistant" || chat.Role.Label === "user"
              )
              .map((chat: any) => ({
                role: chat.Role.Label,
                text: chat.Content,
              }));
            setMessages(newMessages);
          }
        })
        .catch((error) => console.error("Error fetching chat history:", error));
    }
    if(sessionStorage.getItem('userId')==null || sessionStorage.getItem('userId')?.length==0) {
      const userData = {
        emailId: uMail,
        firstName: fName,
        lastName: lName,
      };
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      // Send userData to your API endpoint
      fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/UserId`, {
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
        .then(async (data) => {
          chatService.joinChat(data as string);
          sessionStorage.setItem('userId', data as string);
          fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/StreamUserData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({userId: data}),
          })
          .then( (response) => {
            if (response.ok) {
              setTimeout(() => {setUserId(data as string)}, 2000);
            }
          })
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }else {
      setUserId(sessionStorage.getItem('userId') as string);
    }
    if(userId){
      chatService.joinChat(userId);
    }

    chatService.msgs$.subscribe((msgs) => {
      if(chatId!==undefined) {
        if (msgs && msgs[chatId]) {
            // console.log('msgs:', msgs[chatId].join(''));
            const newMessage: Message = {
              role: "assistant", // Assuming all messages from Redis are from assistant
              text: msgs[chatId].join(''),
            };
            setMessages((prevMessages) => {
              // Check if the last message is from the assistant and update it
              if (
                prevMessages.length > 0 &&
                prevMessages[prevMessages.length - 1].role === "assistant"
              ) {
                return prevMessages.slice(0, -1).concat(newMessage);
              } else {
                // If the last message is not from the assistant, add the new message
                return [...prevMessages, newMessage];
              }
            });
          }
      }else if(currentChatId!==undefined) {
        if (msgs && msgs[currentChatId]) {
            // console.log('msgs:', msgs[currentChatId].join(''));
            const newMessage: Message = {
              role: "assistant", // Assuming all messages from Redis are from assistant
              text: msgs[currentChatId].join(''),
            };
            setMessages((prevMessages) => {
              // Check if the last message is from the assistant and update it
              if (
                prevMessages.length > 0 &&
                prevMessages[prevMessages.length - 1].role === "assistant"
              ) {
                return prevMessages.slice(0, -1).concat(newMessage);
              } else {
                // If the last message is not from the assistant, add the new message
                return [...prevMessages, newMessage];
              }
            });
          }
      }else {
        if (msgs && msgs[userId || '']) {
            // console.log('msgs:', msgs[userId || ''].join(''));
            const newMessage: Message = {
              role: "assistant", // Assuming all messages from Redis are from assistant
              text: msgs[userId || ''].join(''),
            };
            setMessages((prevMessages) => {
              // Check if the last message is from the assistant and update it
              if (
                prevMessages.length > 0 &&
                prevMessages[prevMessages.length - 1].role === "assistant"
              ) {
                return prevMessages.slice(0, -1).concat(newMessage);
              } else {
                // If the last message is not from the assistant, add the new message
                return [...prevMessages, newMessage];
              }
            });
          }
      }
    });
  }, [userId, currentChatId]);

    

    return (
        <VisibilityProvider>
            <div className="relative z-0 flex h-screen w-full overflow-hidden">
                <ChatHistory service={chatService} firstName={fName} lastName={lName} userImage={uImg} />
                <div className="relative flex-1 flex-col overflow-hidden">
                    <div className='h-screen w-full flex-1 overflow-auto transition-width'>
                        <Sidebar/>
                        <div className="flex h-screen flex-col">
                            <Header service={chatService}/><ModelSelect service={chatService}/>
                            <div className='flex flex-col-reverse h-full overflow-y-auto'>
                                <div className="translateZ(0px)">
                                    {messages.length === 0 ? ( <Greet />) : 
                                    (messages.map((message, index) => (
                                            <div key={index} className='px-4 py-2 justify-center text-base md:gap-6 mb-8'>
                                                <div className='flex flex-1 text-base mx-auto gap-3 md:px-5 lg:px-1 xl:px-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] group'>
                                                    <div className="flex-shrink-0 flex flex-col relative items-end">
                                                        <div>
                                                            <div className="pt-0.5">
                                                                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
                                                                    <div className="relative flex">
                                                                    {message.role === 'user' ? 
                                                                    (<img alt="User" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="rounded-sm" style={{color: 'transparent'}} src={uImg}/>) 
                                                                    : (<img className="mx-auto h-6 w-6 " src="/icon.svg" alt="ChatIQ" />)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='relative flex w-full flex-col'>
                                                        <div className="font-bold select-none capitalize">
                                                          {message.role==='user'? (fName):('ChatIQ')}</div>
                                                        <div className='min-h-[20px] font-sans flex flex-col items-start gap-3 whitespace-pre-wrap break-words mt-1 overflow-x-auto'>
                                                        {message.isPlaceholder ? (
                                                            <SkeletonLoader />
                                                        ) : (
                                                            <ReactMarkdown>{message.text}</ReactMarkdown>
                                                        )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
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
