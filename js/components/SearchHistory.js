/**
 * SearchHistory Component
 * Manages search history for the application
 */
export class SearchHistory {
    /**
     * Creates a new SearchHistory instance
     * @param {number} maxItems 
     */
    constructor(maxItems = 5) {
        this.maxItems = maxItems;
        this.history = this.loadHistory();
    }

    /**
     * Adds a new search to the history
     * @param {string} engTitle 
     * @param {string} episode 
     */
    addSearch(engTitle, episode) {
        const search = {
            engTitle,
            episode,
            timestamp: new Date().toISOString()
        };

        this.history = this.history.filter(
            item => !(item.engTitle === engTitle && item.episode === episode)
        );

        // Add to beginning of array
        this.history.unshift(search);

        if (this.history.length > this.maxItems) {
            this.history = this.history.pop();
        }

        this.saveHistory();
        return this.history;
    }

    /**
     * Gets the search history
     * @returns {Array} The search history
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Clears the search history
     */
    clearHistory() {
        this.history = [];
        this.saveHistory();
        return this.history;
    }

    /**
     * Loads the search history from localStorage
     * @returns {Array} The search history
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('searchHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    /**
     * Saves the search history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem("searchHistory", JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    /**
     * Renders the search history to the specified container
     * @param {HTMLElement} container 
     */
    renderHistory(container) {
        if (!container) {
            console.error('No container provided');
            return;
        }

        const history = this.getHistory();
        if (history.length === 0) {
            container.innerHTML = '<div class="history-item">No search history</div>';
            return;
        }

        container.innerHTML = history
            .map((item, index) => `
                <div class="history-item" data-index="${index}">
                    <div class="history-item-title">${item.engTitle}${item.episode ? ` - Episode ${item.episode}` : ''}</div>
                    <div class="history-item-meta">
                        <span>${new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            `)
            .join('');


        container.querySelectorAll('.history-item').forEach((item, index) => {
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                const historyItem = history[index];
                if (this.onItemClick && historyItem) {
                    this.onItemClick(historyItem.engTitle, historyItem.episode);
                }
            });
        });

    }
    
    /**
     * Sets the on item click callback
     * @param {Function} callback 
     */
    setOnItemClick(callback) {
        this.onItemClick = callback;
    }
}



