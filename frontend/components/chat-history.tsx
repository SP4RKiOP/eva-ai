import React, { useEffect, useState } from 'react';
import { useVisibility } from './VisibilityContext';
import { IconChatIQ } from '@/components/ui/icons';
import { ChatService } from '@/lib/service';
import { Menu, MenuButton, MenuItem, MenuItems, Transition, Portal } from '@headlessui/react';
import { signOut } from 'next-auth/react';

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
  chatId: string | undefined;
  onNewChatClick: () => void;
  onOldChatClick: (iD?: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ service, firstName, lastName, userImage, chatId, onNewChatClick, onOldChatClick }) => {
  const { chatHistoryVisible } = useVisibility();
  const { toggleChatHistoryVisibility } = useVisibility();
  const [chatTitles, setChatTitles] = useState<ChatTitle[]>([]); // State to store chat titles

  const handleLogout = async () => {
    localStorage.removeItem('chatTitles');
    sessionStorage.removeItem('models');
    sessionStorage.removeItem('userId');
    // Sign out using NextAuth
    await signOut({ callbackUrl: '/login' }); // Redirects to the login page after logout
  };

  const handleRename = (chatId: string) => {
    // Logic to rename the chat
    console.log('Rename chat:', chatId);
  };

  const handleDelete = (chatId: string) => {
    // Logic to delete the chat
    console.log('Delete chat:', chatId);
  };

  useEffect(() => {
    const fetchAndStoreChatTitles = async () => {
      const cachedTitles = localStorage.getItem('chatTitles');
      let existingTitles: ChatTitle[] = [];

      if (cachedTitles) {
        // Parse the cached titles and update the state
        existingTitles = JSON.parse(cachedTitles).map((title: string) => {
          const parsedTitle = JSON.parse(title);
          parsedTitle.CreatedOn = new Date(parsedTitle.CreatedOn);
          return parsedTitle;
        });
      }

      setChatTitles(existingTitles);

      // Subscribe to the service for updates
      const subscription = service.chatTitles$.subscribe((ttls) => {
        if (ttls && ttls.length > 0) {
          const newTitles = ttls.map((title: string) => {
            const parsedTitle = JSON.parse(title);
            parsedTitle.CreatedOn = new Date(parsedTitle.CreatedOn);
            return parsedTitle;
          });

          // Merge new titles with existing titles
          const combinedTitles = [...existingTitles, ...newTitles];

          // Use a Map to remove duplicates and keep the most recent one
          const uniqueTitlesMap = new Map<string, ChatTitle>();
          combinedTitles.forEach((title) => {
            if (!uniqueTitlesMap.has(title.ChatId) || uniqueTitlesMap.get(title.ChatId)!.CreatedOn < title.CreatedOn) {
              uniqueTitlesMap.set(title.ChatId, title);
            }
          });

          // Convert the Map back to an array
          const uniqueTitles = Array.from(uniqueTitlesMap.values());

          // Sort the titles by CreatedOn date
          uniqueTitles.sort((a: ChatTitle, b: ChatTitle) => b.CreatedOn.getTime() - a.CreatedOn.getTime());

          setChatTitles(uniqueTitles);
          // Update the local storage with the merged and sorted data
          localStorage.setItem('chatTitles', JSON.stringify(uniqueTitles.map((title) => JSON.stringify(title))));
        } else {
          if (!localStorage.getItem('chatTitles')) {
            setChatTitles([]);
          }
        }
      });

      // Cleanup subscription on component unmount
      return () => {
        subscription.unsubscribe();
      };
    };

    fetchAndStoreChatTitles();
  }, [service]);

  return (
    <div className={`w-80 inset-0 z-50 md:flex-shrink-0 md:overflow-x-hidden md:w-64 max-md:fixed ${chatHistoryVisible ? 'hidden md:block' : 'block md:hidden'}`}>
      <div className="md:hidden block absolute top-1 right-0 mr-2 z-50">
        <button
          type="button"
          className="ml-1 flex h-10 w-10 items-center justify-center text-black dark:text-white focus:ring-2 focus:ring-white hover-light-dark"
          onClick={toggleChatHistoryVisibility}
        >
          <span className="sr-only">Close sidebar</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>
      </div>
      <div className="h-full chat-history overflow-y-scroll">
        <nav className="flex flex-col justify-between h-full w-full px-3 py-3" aria-label="Chat history">
          <div className="max-md:pt-10">
          <button
            className={`flex h-10 items-center gap-2 rounded-lg p-2 font-bold hover-light-dark`}
            onClick={(e) => {
              e.preventDefault();
              onNewChatClick();
            }}
          >
            <div className="h-7 w-7">
              <div className="gizmo-shadow-stroke relative flex h-full items-center justify-center rounded-full text-gray-950">
                <IconChatIQ className="mx-auto h-10 w-10" />
              </div>
            </div>
            <span className="group-hover:text-gray-950 dark:group-hover:text-gray-200">New Chat</span>
          </button>
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
          ) : (
            <div className="grow flex-col gap-2 pt-4 pb-4 text-sm overflow-y-scroll">
              {chatTitles.map((chatTitle) => (
                <div key={chatTitle.ChatId} className={`relative pt-1 pb-1 overflow-x-hidden whitespace-nowrap group`}>
                  <div className={`group flex items-center h-8 rounded-lg px-2 font-medium hover-light-dark ${chatTitle.ChatId == chatId ? 'skeleton' : ''}`}>
                    {/* <a onClick={() => onOldChatClick(chatTitle.ChatId)}  className="group-hover:text-gray-950 dark:group-hover:text-gray-200 truncate hover:text-clip">
                      {chatTitle.ChatTitle}
                    </a> */}
                    <button
                      className={`group-hover:text-gray-950 dark:group-hover:text-gray-200 truncate hover:text-clip`}
                      onClick={() => onOldChatClick(chatTitle.ChatId)}
                    >{chatTitle.ChatTitle}</button>
                  </div>
                  {/* Dropdown menu for each chat title */}
                  <div className={`absolute right-9 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 ${chatTitle.ChatId == chatId ? 'opacity-100' : ''} transition-opacity `}>
                    <Menu as="div" className=" fixed text-left z-50 ">
                      <div >
                        <MenuButton className="backdrop-blur-sm inline-flex justify-center w-full p-2 text-sm font-medium text-gray-800 dark:text-white rounded-r-lg focus:outline-none">
                          <svg className="w-5 h-4 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                            <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                          </svg>
                        </MenuButton>
                      </div>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <MenuItems className="absolute mt-1 max-md:-ml-20 w-30 md:w-36 origin-top-right rounded-2xl shadow-lg bg-neutral-300 dark:bg-[#212121] ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1 px-1">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleRename(chatTitle.ChatId)}
                                  className={`block w-full text-left px-4 py-2 text-sm rounded-xl ${active ? 'bg-neutral-400 dark:bg-neutral-600' : ''}`}
                                >
                                  Rename
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(chatTitle.ChatId)}
                                  className={`block w-full text-left px-4 py-2 text-sm rounded-xl ${active ? 'bg-neutral-400 dark:bg-neutral-600' : ''}`}
                                >
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                          </div>
                        </MenuItems>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="w-full left-0 right-0 chat-history">
            <Menu as="div" className="relative w-full">
              <div>
                <MenuButton className="flex items-center gap-2 rounded-lg p-2 text-sm hover-light-dark w-full">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center overflow-hidden rounded-full">
                      <div className="relative flex">
                        <img
                          alt="User"
                          loading="lazy"
                          width="32"
                          height="32"
                          decoding="async"
                          data-nimg="1"
                          className="rounded-sm"
                          style={{ color: 'transparent' }}
                          src={userImage}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative -top-px grow -space-y-px overflow-hidden text-ellipsis whitespace-nowrap text-left">
                    <div>
                      {firstName} {lastName}
                    </div>
                  </div>
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                    <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                  </svg>
                </MenuButton>
              </div>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute bottom-full right-0 mt-2 w-48 origin-bottom-right rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 bg-neutral-300 dark:bg-[#212121]">
                  <div className="py-1 px-1">
                    <MenuItem>
                      {({ active }) => (
                        <button className={`block w-full text-left px-4 py-2 text-sm rounded-xl ${active ? 'bg-neutral-400 dark:bg-neutral-600' : ''}`}>
                          Profile
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button className={`block w-full text-left px-4 py-2 text-sm rounded-xl ${active ? 'bg-neutral-400 dark:bg-neutral-600' : ''}`}>
                          Settings
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm rounded-xl ${active ? 'bg-neutral-400 dark:bg-neutral-600' : ''}`}
                        >
                          Logout
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default ChatHistory;
