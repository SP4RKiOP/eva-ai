import React, { useState, useRef, useEffect  } from 'react';
import SampleInput from './sample-input';

interface InputProps {
    onSubmit: (text: string) => void;
    messagesLength: number;
}

const Input: React.FC<InputProps> = ({ onSubmit, messagesLength }) => {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            // Adjust the height of the textarea based on its scrollHeight
            textareaRef.current.style.height = 'auto'; // Reset the height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]); // Re-run this effect whenever the text changes


    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = event.target.value;
        setText(newText);
        setIsTyping(newText.trim().length > 0);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (text.trim().length > 0) {
            onSubmit(text);
            setText('');
            setIsTyping(false);
        }
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent form submission
            handleSubmit(event as any);
        }
    };

    return (
        <div className="w-full pt-2 md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:w-[calc(100%-.5rem)]">
            <form onSubmit={handleSubmit} className='stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl'>
                <div className="relative flex h-full flex-1 items-stretch md:flex-col">
                    {messagesLength === 0 && <SampleInput /> }
                    <div className="flex w-full items-center">
                        <div className={`overflow-hidden flex flex-col w-full border-black dark:border-white/50 flex-grow relative border border-token-border-heavy dark:text-white rounded-2xl bg-token-main-surface-primary ${(!isTyping || text.trim().length === 0) && 'opacity-50'}`}>
                            <textarea
                                ref={textareaRef}
                                id="prompt-textarea"
                                tabIndex={0}
                                rows={1}
                                placeholder="Message ChatIQ…"
                                value={text}
                                onChange={handleChange}
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(text.trim().length > 0)}
                                onKeyDown={handleKeyDown}
                                className="m-0 w-full resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 dark:bg-transparent max-h-25 py-[10px] pr-10 md:py-3.5 md:pr-12 placeholder-black dark:placeholder-white/50 pl-3 md:pl-4"
                                style={{ maxHeight: '240px', overflowY: 'auto' }}
                            />
                            <button
                                type="submit"
                                
                                disabled={!isTyping || text.trim().length === 0}
                                className={`absolute h-8 w-8 top-1.5 right-1.5 rounded-lg border ${isTyping && text.trim().length > 0 ? 'border-black bg-black' : 'border-black bg-black'} p-0.5 text-white transition-colors disabled:opacity-10 dark:border-white dark:bg-white dark:hover:bg-white md:top-2.5 md:right-2.5`}
                                data-testid="send-button"
                            >
                                <span className="flex justify-center" data-state="closed">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white dark:text-black">
                                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <div className="relative px-2 py-2 text-center text-xs text-token-text-secondary md:px-[60px]">
                <span>ChatIQ is stable & fast but can do mistake(Obviously probability is very low!!). Consider checking important information.</span>
            </div>
        </div>
    );
};

export default Input;
