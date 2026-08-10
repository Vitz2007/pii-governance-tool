import React from 'react';

// Define debounce function
function debounce (func, wait){
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Custom hook for debouncing value
export function useDebounce(callback, delay) {
    const callbackRef = React.useRef(callback);

    React.useLayoutEffect(() => {
        callbackRef.current = callback;
    });

return React.useMemo(() => debounce((...args) => callbackRef.current(...args), delay),
[delay]);
}