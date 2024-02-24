import React from 'react';

const ModelSelect: React.FC = () => {
    return (
        <div className="left-0 right-0">
            <div className="sticky top-0 mb-1.5 flex items-center justify-between z-10 h-14 p-2 font-semibold bg-token-main-surface-primary">
                <div className="absolute left-1/2 -translate-x-1/2"></div>
                <div className="flex items-center gap-2">
                    <div className="group flex cursor-pointer items-center gap-1 rounded-xl py-2 px-3 text-lg font-medium hover:bg-token-main-surface-secondary radix-state-open:bg-token-main-surface-secondary" id="radix-:rt:" aria-haspopup="menu" aria-expanded="false" data-state="closed">
                        <div>ChatGPT <span className="text-token-text-secondary">3.5</span></div>
                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" className="text-token-text-tertiary">
                            <path d="M11.3346 7.83203L8.00131 11.1654L4.66797 7.83203" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </div>
                </div>
                <div className="flex gap-2 pr-1"></div>
            </div>
        </div>
    );
};

export default ModelSelect;
