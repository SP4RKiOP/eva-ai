// chat.tsx
"use client";
import React, { useEffect, useState } from 'react';
import Input from './input';
import ChatHistory from './chat-history';
import Sidebar from './sidebar';
import Header from './header';
import ModelSelect from './model-select';
import Greet from './greet';

interface Message {
  role: string;
  text: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatHistoryVisible, setChatHistoryVisible] = useState<boolean>(true);
    const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
    const toggleChatHistoryVisibility = () => {
        setChatHistoryVisible((prevVisibility) => !prevVisibility);
    };

    const handleMessageSubmit = async (text: string) => {
        try {
            const response = await fetch('https://localhost:7083/api/Semantic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 1,
                    userInput: text
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch response from server');
            }
            const data = await response.json();
            const chatHistory = data?.JsonChatHistory;
            if (chatHistory && chatHistory.length > 0) {
                const newMessages: Message[] = chatHistory
                    .filter((chat: any) => chat.Role.Label === "assistant" || chat.Role.Label === "user")
                    .map((chat: any) => ({
                        role: chat.Role.Label,
                        text: chat.Content
                    }));
                setMessages((prevMessages) => [...prevMessages, ...newMessages]);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobileScreen(window.innerWidth <= 768);
            setChatHistoryVisible(window.innerWidth > 768);
        };

        // Call handleResize on initial load
        handleResize();
        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Remove event listener on component unmount
        return () => window.removeEventListener('resize', handleResize); 
    }, []);
    

    return (
        <div className="relative z-0 flex h-screen w-full overflow-hidden">
            <ChatHistory visible={chatHistoryVisible} onClose={() => setChatHistoryVisible(false)} />
            <div className="relative flex-1 flex-col overflow-hidden">
                <div className='h-screen w-full flex-1 overflow-auto transition-width'>
                    {isMobileScreen || <Sidebar onClick={toggleChatHistoryVisibility} chatHistoryVisible={chatHistoryVisible} />}
                    <div className="flex h-screen flex-col" role="presentation">
                        {isMobileScreen ? <Header onClick={toggleChatHistoryVisibility}/> : <ModelSelect />}
                        <div className="flex-1 h-full max-h-screen overflow-y-auto">
                            {messages.length === 0 ? ( // Conditionally render Greet component
                                <Greet />
                            ) : (
                                messages.map((message, index) => (
                                    <div key={index} className='px-4 py-2 justify-center text-base md:gap-6 m-auto'>
                                        <div className='flex flex-1 text-base mx-auto gap-3 md:px-5 lg:px-1 xl:px-5 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] group'>
                                            <div className='relative flex w-full flex-col'>
                                                <div className="font-semibold select-none">{message.role}</div>
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
    );
};

export default Chat;
