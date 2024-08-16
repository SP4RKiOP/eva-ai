import React, {useEffect, useState} from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ChatService } from '@/lib/service';

interface Model {
  id: number;
  modelName: string;
}
interface ModelSelectProps {
    service:ChatService;
}

const ModelSelect: React.FC<ModelSelectProps> = ({service}) => {
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');

    useEffect(() => {
        // Load models from session storage if available
        const savedModels = sessionStorage.getItem('models');
        if (savedModels) {
        setModels(JSON.parse(savedModels));
        }
        // Subscribe to availableModels changes
        const subscription = service.availableModels$.subscribe(models => {
          if(models && models.length > 0) {
            setModels(models);
            sessionStorage.setItem('models', JSON.stringify(models));
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
        <div className="hidden md:block left-0 right-0 py-2">
            <div className="sticky top-0 mb-1.5 flex items-center justify-between z-10 h-14 p-2 font-semibold bg-token-main-surface-primary">
                <div className="absolute left-1/2 -translate-x-1/2"></div>
                <div className="flex items-center gap-2 hover-light-dark dark:hover:bg-neutral-900 rounded-lg">
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md  px-3 py-2 text-sm font-semibold">
                                {selectedModel || 'Default Model'}
                                <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
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
                            <MenuItems className="absolute left-0 z-10 mt-2 w-48 origin-top-right rounded-md  shadow-lg ring-1 ring-black ring-opacity-5 bg-neutral-300 dark:bg-neutral-900">
                            {models.length <= 0 ? (
                                <div className="py-1 px-1">
                                    <MenuItem>
                                    <div className="animate-pulse">
                                        <div className="mb-1 h-6 rounded skeleton"></div>
                                        <div className="mb-1 h-6 rounded skeleton"></div>
                                        <div className="h-6 rounded skeleton"></div>
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
                                                    className={`rounded-md px-4 w-full py-2 text-sm text-left ${focus? 'bg-neutral-400 dark:bg-neutral-800' : ''}`}
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
                <div className="flex gap-2 pr-1"></div>
            </div>
        </div>
    );
};

export default ModelSelect;
