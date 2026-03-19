// Utility functions for the application

/**
 * Capitalizes the first letter of each word in a string, except for certain small words
 * @param {string} str - The string to capitalize
 * @returns {string} The properly capitalized string
 * @example
 * toTitleCase("attack on titan"); // "Attack on Titan"
 */
export function toTitleCase(str) {
    if (!str) return '';
    
    // Words to keep in lowercase (add more as needed)
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
    
    return str
        .toLowerCase()
        .split(' ')
        .map((word, index, words) => {
            // Skip empty strings from multiple spaces
            if (!word) return '';
            
            // Always capitalize first and last words
            if (index === 0 || index === words.length - 1) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            
            // Don't capitalize small words
            return smallWords.test(word) 
                ? word 
                : word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay (default: 300ms)
 * @returns {Function} The debounced function
 * @example
 * const debouncedFn = debounce(() => console.log('Debounced!'), 500);
 * window.addEventListener('resize', debouncedFn);
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

