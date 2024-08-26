import React, { useEffect, useState} from 'react';
import Input from './input';
import ChatHistory from './chat-history';
import Sidebar from './sidebar';
import HeaderMobile from './header-mobile';
import HeaderDesktop from './header-desktop';
import Greet from './greet';
import { VisibilityProvider } from './VisibilityContext';
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { ChatService } from '@/lib/service';
import { useSession } from "next-auth/react";
import { CodeBlock } from './ui/codeblock';
import { MemoizedReactMarkdown } from './markdown';
interface ChatProps {
    chatId?: string;
    fName: string;
    lName: string;
    uMail: string;
    uImg: string;
    chatService: ChatService;
}

interface Message {
  role: string;
  text: string;
  isPlaceholder?: boolean;
}


const Chat: React.FC<ChatProps> = ({chatService,chatId, fName, lName, uMail, uImg}) => {
    const { data: session, status } = useSession();
    const [userId, setUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
    const getuId_token = async () => {
      const userData = {
        emailId: uMail,
        firstName: fName,
        lastName: lName,
        partner: (session as any)?.partner || window.sessionStorage.getItem('partner'),
      };
        const response = await fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/UserId`, {
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
            window.localStorage.setItem('back_auth', response.headers.get('authorization') as string);
            // add back_auth to session user data
            return response.text();
          })
    };
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
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${window.localStorage.getItem('back_auth')}`
                },
                body: JSON.stringify({
                    userId: userId,
                    modelId: chatService.selectedModelId$.value,
                    userInput: text,
                    chatId: currentChatId
                })
            });
            if (response.status == 401 || !response.ok) {
                getuId_token();
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
    const handleNewChat = () => {
      setMessages([]);
      window.history.pushState({}, '', `/`);
      setCurrentChatId(undefined);
    };
    const handleOldChat = async (iD?: string) => {
      setMessages([]);
      window.history.pushState({}, '', `/c/${iD}`);
      setCurrentChatId(iD);
    };

    useEffect(() => {
      if((session as any)?.partner){
        window.sessionStorage.setItem('partner', (session as any)?.partner);
      }
    // Fetch latest chat history
    if (currentChatId) {
      if(messages.length==0) {
        fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Semantic/convhistory/${currentChatId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${window.localStorage.getItem('back_auth')}`
          },
        }
        )
          .then((response) => 
            response.status == 401 ? getuId_token() : response.json())
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
    }
    if((window.sessionStorage.getItem('userId')==null || window.sessionStorage.getItem('userId')?.length==0) && status=='authenticated') {
      
      const userData = {
        emailId: uMail,
        firstName: fName,
        lastName: lName,
        partner: (session as any)?.partner || window.sessionStorage.getItem('partner'),
      };
      // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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
          window.localStorage.setItem('back_auth', response.headers.get('authorization') as string);
          // add back_auth to session user data
          return response.text();
        })
        .then(async (data) => {
          console.log("User ID on chat:", data);
          if(chatService.HubConnectionState$.value=="Connected" && !chatService.roomJoined$.value) {
            chatService.joinChat(data as string);
          }
          window.sessionStorage.setItem('userId', data as string);
          fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/StreamUserData`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${window.localStorage.getItem('back_auth')}`
            },
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
      setUserId(window.sessionStorage.getItem('userId') as string);
    }
    if(userId){
      if(chatService.HubConnectionState$.value=="Connected" && !chatService.roomJoined$.value) {
        chatService.joinChat(userId);
      }
    }

    const subscription = chatService.msgs$.subscribe((msgs) => {
      if(currentChatId!==undefined) {
        if (msgs && msgs[currentChatId]) {
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
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, currentChatId]);

    

    return (
        <VisibilityProvider>
            <div className="relative z-0 flex h-screen w-full overflow-hidden">
                <ChatHistory service={chatService} firstName={fName} lastName={lName} userImage={uImg} uMail={uMail} session={session} chatId={currentChatId} onNewChatClick={() => handleNewChat()} onOldChatClick={(iD? : string) => handleOldChat(iD)}/>
                <div className="relative flex-1 flex-col overflow-hidden">
                    <div className='h-screen w-full flex-1 overflow-auto transition-width'>
                        <Sidebar/>
                        <div className="flex h-screen flex-col">
                            <HeaderMobile service={chatService} onNewChatClick={() => handleNewChat()}/><HeaderDesktop service={chatService}/>
                            <div className='flex flex-col-reverse h-full overflow-y-auto'>
                                <div className="translateZ(0px)">
                                    {messages.length === 0 ? ( <Greet />) : 
                                    (messages.map((message, index) => (
                                            <div key={index} className={`px-4 py-2 w-full justify-center text-base md:gap-6 mb-8 `}>
                                              {/* <div className="h-1 bg-gradient-to-r from-black to-black mx-auto gap-3 md:px-5 lg:px-1 xl:px-5 mb-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"></div> */}
                                                <div className='flex flex-1 w-full text-base mx-auto gap-3 md:px-5 lg:px-1 xl:px-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] group'>
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
                                                    <div className='relative overflow-hidden flex w-full flex-col'>
                                                        <div className="font-bold select-none capitalize">
                                                          {message.role==='user'? (fName):('ChatIQ')}</div>
                                                          <div className={`flex ${message.role === 'user' ? 'place-content-end' : ''}`}>
                                                            <div className={`min-h-[20px] font-sans flex flex-col  gap-3 whitespace-pre-wrap break-words mt-1 overflow-x-auto ${message.role === 'user' ? 'bg-gray-300 dark:bg-[#2f2f2f] dark:text-white rounded-xl px-5 py-1.5 w-fit' : ''}`}>
                                                              {message.isPlaceholder ? (
                                                                  <SkeletonLoader />
                                                              ) : (
                                                                  <div className=''><MemoizedReactMarkdown
                                                                  className='prose prose-neutral break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0'
                                                                  remarkPlugins={[remarkGfm, remarkMath]}
                                                                  components={{
                                                                    code({ node, inline, className, children, ...props }) {
                                                                      if (children.length) {
                                                                        if (children[0] == '▍') {
                                                                          return (
                                                                            <span className="mt-1 cursor-default animate-pulse">▍</span>
                                                                          )
                                                                        }
                                                        
                                                                        children[0] = (children[0] as string).replace('`▍`', '▍')
                                                                      }
                                                                        const match = /language-(\w+)/.exec(className || '');
                                                                        if (inline) {
                                                                          return (
                                                                            <code className={className} {...props}>
                                                                              {children}
                                                                            </code>
                                                                          )
                                                                        }
                                                                        return match ? (
                                                                          <CodeBlock
                                                                          key={Math.random()}
                                                                          language={(match && match[1]) || ''}
                                                                          value={String(children).replace(/\n$/, '')}
                                                                          {...props}
                                                                        />
                                                                        ) : (
                                                                            <code className={className} {...props}>
                                                                                {children}
                                                                            </code>
                                                                        )
                                                                    },
                                                                }}>{message.text}</MemoizedReactMarkdown></div>
                                                              )}
                                                            </div>
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
