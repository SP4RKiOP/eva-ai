import React, { useEffect, useState } from 'react';
import { useVisibility } from './VisibilityContext';
import { ChatService } from '@/lib/service';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface Model {
  id: number;
  modelName: string;
}

interface HeaderProps {
  service: ChatService;
}

const Header: React.FC<HeaderProps> = ({ service }) => {
  const { toggleChatHistoryVisibility } = useVisibility();
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    // Load models from session storage if available
    const savedModels = window.sessionStorage.getItem('models');
    if (savedModels) {
    setModels(JSON.parse(savedModels));
    }
    // Subscribe to availableModels changes
    const subscription = service.availableModels$.subscribe(models => {
      if(models && models.length > 0) {
        setModels(models);
        window.sessionStorage.setItem('models', JSON.stringify(models));
      }
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, [service]);

  const handleModelChange = (modelName: string, id: number) => {
    setSelectedModel(modelName);
    service.selectedModelId$.next(id);
  };
  
  return (
    <div className="text-token-primary sticky top-0 z-10 flex min-h-[40px] items-center justify-center border-b pl-1 md:hidden">
      <button type="button" className="absolute bottom-0 left-0 top-0 inline-flex items-center justify-center rounded-md px-3 hover-light-dark dark:hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white active:opacity-50" onClick={toggleChatHistoryVisibility}>
        <span className="sr-only">Open sidebar</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M3 8C3 7.44772 3.44772 7 4 7H20C20.5523 7 21 7.44772 21 8C21 8.55228 20.5523 9 20 9H4C3.44772 9 3 8.55228 3 8ZM3 16C3 15.4477 3.44772 15 4 15H14C14.5523 15 15 15.4477 15 16C15 16.5523 14.5523 17 14 17H4C3.44772 17 3 16.5523 3 16Z" fill="currentColor"></path>
        </svg>
      </button>
      <div className="group flex cursor-pointer items-center gap-1 rounded-xl hover-light-dark dark:hover:bg-neutral-900">
      <Menu as="div" className="relative inline-block text-left">
        <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-xl  px-3 py-2 text-sm font-semibold">
                {selectedModel || 'Default Model'}
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400"/>
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
            <MenuItems className="absolute left-1/2 -translate-x-1/2 z-10 mt-2 w-48 origin-top-right rounded-xl  shadow-lg ring-1 ring-black ring-opacity-5 bg-neutral-300 dark:bg-[#171717]">
            {models.length <= 0 ? (
                <div className="py-1 px-1">
                    <MenuItem>
                    <div className="animate-pulse">
                        <div className="mb-1 h-6 rounded-xl skeleton"></div>
                        <div className="mb-1 h-6 rounded-xl skeleton"></div>
                        <div className="h-6 rounded-xl skeleton"></div>
                    </div>
                    </MenuItem>
                </div>
            ):(
              <div className="py-1 px-1">
                    {models.map((model) => (
                        <MenuItem key={model.id} >
                            {({ focus }) => (
                                <button
                                    onClick={() => handleModelChange(model.modelName, model.id)}
                                    className={`rounded-xl px-4 w-full py-2 text-sm text-left ${focus? 'bg-neutral-400 dark:bg-neutral-800' : ''}`}
                                >
                                    {model.modelName}
                                </button>
                            )}
                        </MenuItem>
                    ))}
                </div>
            )}
                
            </MenuItems>
        </Transition>
    </Menu>
      </div>
      <div className="absolute bottom-0 right-0 top-0 flex items-center">
        <button type="button" className="px-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.7929 2.79289C18.0118 1.57394 19.9882 1.57394 21.2071 2.79289C22.4261 4.01184 22.4261 5.98815 21.2071 7.20711L12.7071 15.7071C12.5196 15.8946 12.2652 16 12 16H9C8.44772 16 8 15.5523 8 15V12C8 11.7348 8.10536 11.4804 8.29289 11.2929L16.7929 2.79289ZM19.7929 4.20711C19.355 3.7692 18.645 3.7692 18.2071 4.2071L10 12.4142V14H11.5858L19.7929 5.79289C20.2308 5.35499 20.2308 4.64501 19.7929 4.20711ZM6 5C5.44772 5 5 5.44771 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V14C19 13.4477 19.4477 13 20 13C20.5523 13 21 13.4477 21 14V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34314 4.34315 3 6 3H10C10.5523 3 11 3.44771 11 4C11 4.55228 10.5523 5 10 5H6Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;
