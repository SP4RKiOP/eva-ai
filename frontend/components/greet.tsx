import React from 'react';
import { IconChatIQ } from './ui/icons';

const Greet: React.FC = () => {
    return (
        <div className="flex mb-96 flex-col items-center justify-center">
            <div className="relative">
                <div className="mb-3 h-12 w-12">
                    <img src="/icon.svg" alt="ChatIQ" />
                </div>
            </div>
            <div className="mb-5 text-2xl font-medium">How can I help you today?</div>
        </div>
    );
}

export default Greet;
