import React from 'react';
import { IconEva } from './ui/icons';

const Greet: React.FC = () => {
    return (
        <div className="flex flex-col items-center mb-[calc(100vh-60vh)]">
            <div className="relative">
                <div className="mb-3 h-16 w-16">
                    <img src="/icon.svg" alt="Eva" />
                </div>
            </div>
            <div className="mb-5 text-4xl font-medium">Eva.AI</div>
        </div>
    );
}

export default Greet;
