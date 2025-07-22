/**
 * LoadingState Component.
 * Manages the loading state of the application
*/
export class LoadingState {
    constructor() {
        this.loadingState = document.getElementById("loadingState");
        this.emptyState = document.querySelector(".empty-state");
        
        this.resultsContainer = document.querySelector(".results-container");
        this.discussionResults = document.getElementById("discussionResults");
        
        this.form = document.getElementById("searchForm");
        this.submitButton = document.querySelector('button[type="submit"]');
        
        
        this.originalButtonText = this.submitButton ? this.submitButton.innerHTML : '';
        this.isLoading = false;
        this.interval;


        this.messages = [
            "Searching Reddit...",
            "Making the API calls...",
            "This is taking longer than expected...",
            "Maybe it's user error...",
            "Just a bit longer, I promise..."
        ];
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        this.isLoading = true;

        // Hide empty state 
        if (this.emptyState) {
            this.emptyState.style.display = "none";
        }

        if (this.loadingState) {
            this.loadingState.style.display = "flex";
            const loadingText = document.querySelector(".loading-text");


            let index = 0;
            if (this.loadingText) {
                loadingText.textContent = messages[index];
            }

            if (this.interval){
                clearInterval(this.interval);
            }

            this.interval = setInterval(() => {
                index = (index + 1) % this.messages.length;
                loadingText.textContent = this.messages[index];
            }, 2000);

            if (this.submitButton) {
                this.submitButton.disabled = true;
                this.submitButton.innerHTML =
                    `
                <span class="button-loading">
                    <span class='spinner-button'></span>
                    ${this.messages[0]}
                </span>
                `;
            }

            this.form?.classList.add("form-loading");
            return this;
        };
    }


    /**
    * Stop loading state and show empty state if showEmptyState is true
    * @param {boolean} [showEmptyState=true] - Whether to show empty state
    * @param {string} [message="No results found"] - Message to display
    * @param {string} [subMessage=""] - Sub-message to display
    */
    stopLoading(showEmptyState = true, message = "No results found", subMessage = "") {
        clearInterval(this.interval);

        this.isLoading = false;

        if (this.loadingState) {
            this.loadingState.style.display = 'none';
        }
        
        if (this.submitButton) {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = this.originalButtonText;
        }

        if (showEmptyState && this.emptyState) {
            if (!this.emptyState) return;
        
            const title = this.emptyState.querySelector('h3');
            const subText = this.emptyState.querySelector('p');
        
            if (title) title.textContent = message;
            if (subText && subMessage) subText.textContent = subMessage;
        
            this.emptyState.style.display = 'flex';
            this.loadingState.style.display = 'none';
        }
        
        this.form?.classList.remove("form-loading");
        return this;
    };

    /**
     * Show results container
     */
    showResults() {
        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'block';
        }

        return this.stopLoading(false);
    };


}