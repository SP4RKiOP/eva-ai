import React, { useEffect, useRef, useState } from 'react';
import { useVisibility } from './VisibilityContext';
import { IconEva } from '@/components/ui/icons';
import { Menu, MenuButton, MenuItem, MenuItems, Transition, Portal } from '@headlessui/react';
import { signOut } from 'next-auth/react';
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChatService } from '@/lib/service';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
interface ChatTitle {
  id: string;
  title: string;
  lastActivity: string;
}

interface ChatHistoryProps {
  uMail: string;
  firstName: string;
  lastName: string;
  userImage: string;
  partner: string;
  chatId: string | undefined;
  chatService: ChatService;
  onNewChatClick: () => void;
  onOldChatClick: (iD?: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ uMail, firstName, lastName, userImage, partner, chatId, chatService, onNewChatClick, onOldChatClick }) => {
  const { chatHistoryVisible } = useVisibility();
  const { toggleChatHistoryVisibility } = useVisibility();
  const [chatTitles, setChatTitles] = useState<ChatTitle[]>([]); // State to store chat titles
  const [isFetchingChatTitles, setIsFetchingChatTitles] = useState(true);
  const { toast } = useToast()
  const [title, setTitle] = useState("");
  const fetchedRef = useRef(false);
  const nodeRef = React.useRef(null);
  const getuId_token = async () => {
    const userData = {
      emailId: uMail,
      firstName: firstName,
      lastName: lastName,
      partner: partner,
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
  const handleLogout = async () => {
    window.localStorage.clear();
    window.localStorage.clear();
    await signOut({ callbackUrl: '/login' }); // Redirects to the login page after logout
  };

  const handleRename = (chatId: string, newTitle: string) => {
    fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/conversation/${chatId}/?title=${newTitle}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem('back_auth')}`
      },
    }).then((res) => {
      if(res.status === 401) {
        getuId_token();
      }else if (res.status === 204) {
        toast({
          description: "Chat title updated successfully",
        })
        chatTitles.map((t) => {
          if (t.id === chatId) {
            t.title = newTitle;
          }
        })
        setChatTitles([...chatTitles]);
    }
      })
  };
  const handleDelete = (chatId: string) => {
    fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/conversation/${chatId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${window.localStorage.getItem('back_auth')}`
      },
      body: JSON.stringify({ delete: true }),
    }).then((res) => {
      if(res.status === 401) {
        getuId_token();
      }else if (res.status === 204) {
        toast({
          description: "Chat removed",
        })
        setChatTitles(chatTitles.filter((t) => t.id !== chatId));
    }})
  };
  
  useEffect(() => {
    const getConversations = async () => {
      try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/conversations`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${window.localStorage.getItem('back_auth')}`
          },
        });
        if (response.status == 401) {
          getuId_token();
          return getConversations();
        }
        const data = await response.json();
        if(data!=null && data.length!= 0) {
          if (Object.keys(data).length === 0) {
            // Handle empty JSON object
            setChatTitles([]);
          } else {
            data.sort((a: ChatTitle, b: ChatTitle) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
            setChatTitles(data);
          }
        } else {
          // Handle empty response
          setChatTitles([]);
        }
        setIsFetchingChatTitles(false);
      }
      catch(error) {
        console.error('Error:', error);
        setIsFetchingChatTitles(false);
        setChatTitles([]);
      }
    };

    if (!fetchedRef.current) {
      getConversations();
      fetchedRef.current = true;
    }

    // Subscribe to the endStream$ observable
    const subscription = chatService.endStream$.subscribe(() => {
      setTimeout(() => {
        getConversations();
      }, 500);
    });
    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, [chatService]); 

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
      <div className="h-full chat-history overflow-y-auto">
        <nav className="flex flex-col justify-between h-full w-full px-3 py-3" aria-label="Chat history">
          <div className="max-md:pt-10">
          <button
            className={`flex h-10 items-center gap-2 rounded-lg p-2 font-bold hover-light-dark`}
            onClick={(e) => {
              e.preventDefault();
              if (window.innerWidth < 768) {
                toggleChatHistoryVisibility();
              }
              onNewChatClick();
            }}
          >
            <div className="h-7 w-7">
              <div className="relative flex h-full items-center justify-center rounded-full text-gray-950">
                <IconEva className="mx-auto h-10 w-10" />
              </div>
            </div>
            <span className="group-hover:text-gray-950 dark:group-hover:text-gray-200">New Chat</span>
          </button>
          </div>
          {isFetchingChatTitles ? (
            <div className="flex flex-col grow gap-2 pt-6 pb-4 text-sm animate-pulse">
              <div className="h-6 rounded mb-2 skeleton"></div>
              <div className="h-6 rounded mb-2 skeleton"></div>
              <div className="h-6 rounded mb-2 skeleton"></div>
              <div className="h-6 rounded mb-2 skeleton"></div>
              <div className="h-6 rounded mb-2 skeleton"></div>
              <div className="h-6 rounded mb-2 skeleton"></div>
            </div>
          ) : chatTitles.length === 0 ? (
            <div className={`grow gap-2 pt-8 pb-4 text-sm text-center`}>No Chats Found.<div className='pt-2'>Go Ahead with your first question</div></div>
          ) : (
            <div className="grow flex-col gap-2 pt-4 pb-4 text-sm overflow-y-auto">
              <TransitionGroup>
                {chatTitles.map((chatTitle) => (
                  <CSSTransition
                  key={chatTitle.id}
                  nodeRef={nodeRef}
                  timeout={500}
                  classNames="chat-title"
                  >
                    <div key={chatTitle.id} ref={nodeRef} className={`relative pt-1 pb-1 overflow-x-hidden group`}>
                      <div className={`group flex items-center h-8 rounded-lg px-2 font-medium hover-light-dark ${chatTitle.id == chatId ? 'skeleton' : ''}`}>
                        <button
                          className={`w-full h-full text-left group-hover:text-gray-950 dark:group-hover:text-gray-200 truncate hover:text-clip`}
                          onClick={(e) => { e.preventDefault(); onOldChatClick(chatTitle.id); if (window.innerWidth < 768) {toggleChatHistoryVisibility();}}}
                        >{chatTitle.title}</button>
                      </div>
                      {/* Dropdown menu for each chat title */}
                      <div className={`absolute right-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 `}>
                        <Dialog>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger className="backdrop-blur-sm inline-flex justify-center w-full p-2 text-sm font-medium text-gray-800 dark:text-white rounded-r-lg focus:outline-none">
                                <svg className="w-5 h-4 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                                  <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                                </svg>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="rounded-2xl bg-neutral-300 dark:bg-[#212121]">
                              <DialogTrigger asChild className="block w-full text-left text-sm">
                                <DropdownMenuItem className="rounded-xl hover:bg-neutral-400 hover:dark:bg-neutral-600">Rename</DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem onClick={() => {handleDelete(chatTitle.id)}}
                                      className="rounded-xl hover:bg-neutral-400 hover:dark:bg-neutral-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DialogContent className="max-w-[400px] md:max-w-[425px]">
                            <DialogHeader className="max-md:text-left">
                              <DialogTitle>Edit Chat Title</DialogTitle>
                              <DialogDescription>
                                Click save when you&apos;re done.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-md:justify-start">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                  Title
                                </Label>
                                <Input
                                  id="name"
                                  defaultValue={chatTitle.title}
                                  onChange={(e) => setTitle(e.target.value)} // Update state on input change
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" className="w-fit ml-auto" onClick={() => {handleRename(chatTitle.id, title)}}>
                                  Save changes
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
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
                <MenuItems className="absolute bottom-full right-0 mt-2 w-36 origin-bottom-right rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 bg-neutral-300 dark:bg-[#212121]">
                  <div className="py-1 px-1">
                    <MenuItem>
                      <button className={`block w-full text-left px-4 py-2 text-sm rounded-xl hover:bg-neutral-400 hover:dark:bg-neutral-600`}>
                        Profile
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button className={`block w-full text-left px-4 py-2 text-sm rounded-xl hover:bg-neutral-400 hover:dark:bg-neutral-600`}>
                        Settings
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm rounded-xl hover:bg-neutral-400 hover:dark:bg-neutral-600`}
                      >
                        Logout
                      </button>
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
