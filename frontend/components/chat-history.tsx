"use client";
import React, {useEffect, useState} from 'react';

interface ChatHistoryProps {
  visible: boolean;
  onClose: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ visible, onClose }) => {
  const [mwidth, setWidth] = useState('400px'); // Initial width
  useEffect(() => {
    const element = document.querySelector('.adptView');
    if (element) {
      const styles = window.getComputedStyle(element);
      const modWidth = styles.getPropertyValue('width');
      console.log(modWidth); // Outputs: "260px"
    }
  }, []);
  return (
    <div className={`adptView ${visible ? '' : 'hidden'}`}>
      <div className="isVisible absolute top-1 right-0 mr-2 z-50">
              <button type="button" className="ml-1 flex h-10 w-10 items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={onClose}>
                <span className="sr-only">Close sidebar</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.34315 6.34338L17.6569 17.6571M17.6569 6.34338L6.34315 17.6571" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
      </div>
      <div className="h-full chat-history" style={{width: mwidth}}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="scrollbar-trigger relative h-full w-full flex-1 items-start border-white/20">
            <h2 style={{ position: 'absolute', border: '0px', width: '1px', height: '1px', padding: '0px', margin: '-1px', overflow: 'hidden', clip: 'rect(0px, 0px, 0px, 0px)', whiteSpace: 'nowrap', overflowWrap: 'normal' }}>Chat history</h2>
            <nav className="flex h-full w-full flex-col px-3 pb-3.5" aria-label="Chat history">
              <div className="flex-col flex-1 -mr-2 pr-2 overflow-y-auto">
                <div className="sticky left-0 right-0 top-0 pt-3.5">
                  <div className="pb-0.5 last:pb-0" tabIndex={0}>
                    <a className={`group flex h-10 items-center gap-2 rounded-lg px-2 font-medium hover-light-dark`} href="/">
                      <div className="h-7 w-7 flex-shrink-0">
                        <div className="gizmo-shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-gray-950">
                          <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-2/3 w-2/3" role="img">
                          </svg>
                        </div>
                      </div>
                      <span className="group-hover:text-gray-950 dark:group-hover:text-gray-200">New Chat</span>
                    </a>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
