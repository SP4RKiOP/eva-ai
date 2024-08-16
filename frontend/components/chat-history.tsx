import React, {useEffect, useState} from 'react';
import { useVisibility } from './VisibilityContext';
import {IconChatIQ} from '@/components/ui/icons'
import { ChatService } from '@/lib/service';

interface ChatTitle {
  ChatId: string;
  ChatTitle: string;
  CreatedOn: Date;
}

interface ChatHistoryProps {
  firstName: string;
  lastName: string;
  userImage: string;
  service: ChatService;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ service, firstName, lastName, userImage }) => {
  const { chatHistoryVisible } = useVisibility();
  const { toggleChatHistoryVisibility } = useVisibility();
  const [chatTitles, setChatTitles] = useState<ChatTitle[]>([]); // State to store chat titles
  useEffect(() => {

    const fetchAndStoreChatTitles = async () => {
       const cachedTitles = localStorage.getItem('chatTitles');
       if (cachedTitles) {
         // Parse the cached titles and update the state
         const parsedTitles = JSON.parse(cachedTitles).map((title: string) => {
           const parsedTitle = JSON.parse(title);
           parsedTitle.CreatedOn = new Date(parsedTitle.CreatedOn);
           return parsedTitle;
         });
         setChatTitles(parsedTitles);
       } else {
         // Fetch chat titles from the service
         service.chatTitles$.subscribe((ttls) => {
           if (ttls && ttls.length > 0) {
             const parsedTitles = ttls.map((title: string) => {
               const parsedTitle = JSON.parse(title);
               parsedTitle.CreatedOn = new Date(parsedTitle.CreatedOn);
               return parsedTitle;
             });
             parsedTitles.sort((a: ChatTitle, b: ChatTitle) => b.CreatedOn.getTime() - a.CreatedOn.getTime());
             setChatTitles(parsedTitles);

             // Store the fetched titles in local storage
             localStorage.setItem('chatTitles', JSON.stringify(ttls));
           }
         });
       }
    };
   
    fetchAndStoreChatTitles();
   
    // Subscribe to the service for updates
    const subscription = service.chatTitles$.subscribe((ttls) => {
       if (ttls && ttls.length > 0) {
         const parsedTitles = ttls.map((title: string) => {
           const parsedTitle = JSON.parse(title);
           parsedTitle.CreatedOn = new Date(parsedTitle.CreatedOn);
           return parsedTitle;
         });
         parsedTitles.sort((a: ChatTitle, b: ChatTitle) => b.CreatedOn.getTime() - a.CreatedOn.getTime());
         setChatTitles(parsedTitles);
         // Update the local storage with the new data
         localStorage.setItem('chatTitles', JSON.stringify(ttls));
       }
    });
   
    // Cleanup subscription on component unmount
    return () => {
       subscription.unsubscribe();
    };
   }, []);
  return (
    <div className={` w-80 inset-0 z-50 md:flex-shrink-0 md:overflow-x-hidden md:w-64 max-md:fixed ${chatHistoryVisible ? 'hidden md:block' : 'block md:hidden'}`}>
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
                        <div className="gizmo-shadow-stroke relative flex h-full items-center justify-center rounded-full text-gray-950">
                          <IconChatIQ className="mx-auto h-10 w-10"/>
                        </div>
                      </div>
                      <span className="group-hover:text-gray-950 dark:group-hover:text-gray-200">New Chat</span>
                    </a>
                  </div>
                </div>
                {chatTitles.length === 0 ? (
                  <div className="flex flex-col gap-2 pt-6 pb-4 text-sm animate-pulse">
                  <div className="h-6 rounded mb-2 skeleton"></div>
                  <div className="h-6 rounded mb-2 skeleton"></div>
                  <div className="h-6 rounded mb-2 skeleton"></div>
                  <div className="h-6 rounded mb-2 skeleton"></div>
                  <div className="h-6 rounded mb-2 skeleton"></div>
                  <div className="h-6 rounded mb-2 skeleton"></div>
                </div>
                ): (
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
                )}
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
