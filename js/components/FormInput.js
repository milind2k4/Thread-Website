/**
 * FormInput Component. 
 * Handles the search form input and submission
 */
export class FormInput {
    constructor() {
        // Form Elements
        this.form = document.getElementById('searchForm');
        this.englishTitle = document.getElementById("englishTitle");
        this.errorContainer = document.getElementById("errorContainer");
        this.searchContainer = document.querySelector(".search-container")
        this.episodeNo = document.getElementById("episodeNo");
        this.errorTimeout = null;

        // State
        this.isSubmitting = false;

        // Bind methods to FormInput instance
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     * Initialize the form component
     */
    init() {
        this.form.addEventListener('submit', this.handleSubmit);
    }

    /**
     * Handle form submission
     * @param {Event} event - The form submit event
     */
    async handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();


        this.clearErrors();        
        
        const engTitle = this.englishTitle.value.trim();
        const episode = this.episodeNo.value.trim();
        
        // Show custom error messages
        if (!engTitle) {
            this.showError("Please enter the anime title");
            this.englishTitle.focus();
            return;
        }
        
        if (engTitle.length <= 3) {
            this.showError("Please enter a valid title");
            this.englishTitle.focus();
            return;
        }
        
        if (!episode) {
            this.showError("Please enter the episode number");
            this.episodeNo.focus();
            return;
        }
        
        const episodeNumber = episode.match(/\d+/);
        if (!episodeNumber) {
            this.showError("Please enter a valid episode number");
            this.episodeNo.focus();
            return;
        }
        
        // Inputs are valid
        const searchEvent = new CustomEvent('searchSubmitted', {
            detail: {
                engTitle,
                episode: episodeNumber[0]
            },
            bubbles: true
        });
        this.form.dispatchEvent(searchEvent);
    }

    /**
     * Show a custom error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        // Remove any existing error messages
        this.clearErrors();

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';

        const iconContainer = document.createElement("span");
        iconContainer.className = 'error-icon';

        const iconImg = document.createElement('img');
        iconImg.src = "../../assets/img/warn_icon.svg";
        iconImg.alt = 'Warning';
        iconImg.width = 18;
        iconImg.height = 18;

        const textSpan = document.createElement('span');
        textSpan.className = 'error-text';
        textSpan.textContent = message;

        iconContainer.appendChild(iconImg);
        errorElement.appendChild(iconContainer);
        errorElement.appendChild(textSpan);

        // Insert after the form
        this.errorContainer.innerHTML = '';
        this.errorContainer.appendChild(errorElement);

        this.errorContainer.classList.add('has-error');
        this.errorContainer.closest('.search-container').classList.add('has-error');

        void this.errorContainer.offsetHeight;

        // Store the timeout ID so we can clear it if needed
        this.errorTimeout = setTimeout(() => {
            this.clearErrors();
        }, 2000); // 2 seconds
    }

    /**
     * Clear any displayed error messages
     */
    clearErrors() {
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }


        if (this.errorContainer) {
            this.errorContainer.classList.remove('has-error');
            const searchContainer = this.searchContainer.closest(".search-container");

            if (searchContainer){
                searchContainer.classList.remove("has-error");
            }
            setTimeout(() => {
                if (this.errorContainer && !this.errorContainer.classList.contains("has-error")) {
                    this.errorContainer.innerHTML = '';
                }
            }, 600);
        }
    }

    /**
     * Clear the form inputs
     */
    clearForm() {
        this.form.reset();
        this.clearErrors();
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        this.form.removeEventListener('submit', this.handleSubmit);
    }


}