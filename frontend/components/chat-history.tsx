"use client"
import React, {useEffect, useState} from 'react';
import { useVisibility } from './VisibilityContext';

interface ChatTitle {
  ChatId: string;
  ChatTitle: string;
}

interface ChatHistoryProps {
  firstName: string;
  lastName: string;
  userImage: string;
  userId: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ userId, firstName, lastName, userImage }) => {
  const { chatHistoryVisible } = useVisibility();
  const { toggleChatHistoryVisibility } = useVisibility();
  const [chatTitles, setChatTitles] = useState<ChatTitle[]>([]); // State to store chat titles
  useEffect(() => {
    if(userId && userId.length > 0) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      // Send userData to your API endpoint
      fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Semantic/chat-titles/${userId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to send user data to the API");
            }
            return response.json();
          })
          .then((data) => {
            setChatTitles(data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
    }
   }, [userId]);
  return (
    <div className={`w-96 inset-0 z-50 md:flex-shrink-0 md:overflow-x-hidden md:w-64 max-md:fixed ${chatHistoryVisible ? 'hidden md:block' : 'block md:hidden'}`}>
      <div className="md:hidden block absolute top-1 right-0 mr-2 z-50">
              <button type="button" className="ml-1 flex h-10 w-10 items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={toggleChatHistoryVisibility}>
                <span className="sr-only">Close sidebar</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
      </div>
      <div className="h-full chat-history" >
        <div className="flex h-full min-h-0 flex-col">
          <div className="scrollbar-trigger relative h-full w-full flex-1 items-start border-white/20">
            <nav className="flex h-full w-full flex-col px-3 pb-3.5" aria-label="Chat history">
              <div className="flex-col flex-1 -mr-2 pr-2 overflow-y-auto">
                <div className="sticky left-0 right-0 top-0 pt-3.5">
                  <div className="pb-0.5 last:pb-0" tabIndex={0}>
                    <a className={`group flex h-10 items-center gap-2 rounded-lg px-2 font-medium hover-light-dark`} href="/">
                      <div className="h-7 w-7 flex-shrink-0">
                        <div className="gizmo-shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-gray-950">
                          <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-2/3 w-2/3" role="img">
                          </svg>
                        </div>
                      </div>
                      <span className="group-hover:text-gray-950 dark:group-hover:text-gray-200">New Chat</span>
                    </a>
                  </div>
                </div>
                <div className='flex flex-col gap-2 pt-4 pb-4 text-sm'>
                  {chatTitles.map((chatTitle) => (
                    <div key={chatTitle.ChatId} className="relative grow overflow-hidden whitespace-nowrap">
                      <div className={`group flex items-center h-8 rounded-lg px-2 font-medium hover-light-dark`}>
                      <a href={`/c/${chatTitle.ChatId}`} className="group-hover:text-gray-950 dark:group-hover:text-gray-200 truncate hover:text-clip">
                        {chatTitle.ChatTitle}
                      </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 pb-3.5">
                    <button className="flex w-full items-center gap-2 rounded-lg p-2 text-sm hover:bg-token-sidebar-surface-secondary group-ui-open:bg-token-sidebar-surface-secondary" id="headlessui-menu-button-:r1ha:" type="button" aria-haspopup="true" aria-expanded="false" data-headlessui-state="">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center overflow-hidden rounded-full">
                          <div className="relative flex">
                            <img alt="User" loading="lazy" width="32" height="32" decoding="async" data-nimg="1" className="rounded-sm" style={{color: 'transparent'}} src={userImage} />
                          </div>
                        </div>
                      </div>
                      <div className="relative -top-px grow -space-y-px overflow-hidden text-ellipsis whitespace-nowrap text-left text-token-text-primary">
                        <div>{firstName} {lastName}</div>
                      </div>
                    </button>
                  </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
