import React from 'react';
import { IconEva } from './ui/icons';

const Greet: React.FC = () => {
    return (
        <div className="flex flex-col items-center mb-[calc(100vh-60vh)]">
            <div className="relative">
                <div className="h-16 w-16">
                    <img src="/icon.svg" alt="Eva" />
                </div>
            </div>
            <div className="pt-6 text-4xl font-medium">Eva the Assistant</div>
        </div>
    );
}

export default Greet;
