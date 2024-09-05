import React from 'react';
import { IconChatIQ } from './ui/icons';

const Greet: React.FC = () => {
    return (
        <div className="flex flex-col items-center mb-[calc(100vh-60vh)]">
            <div className="relative">
                <div className="mb-3 h-16 w-16">
                    <img src="/icon.svg" alt="ChatIQ" />
                </div>
            </div>
            <div className="mb-5 text-4xl font-medium">ChatIQ</div>
        </div>
    );
}

export default Greet;
