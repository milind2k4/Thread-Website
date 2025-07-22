import { FormInput } from "./components/FormInput.js";
import { LoadingState } from "./components/LoadingState.js";
import { SearchHistory } from "./components/SearchHistory.js";
import { toTitleCase } from "./core/Utility.js";

document.addEventListener("DOMContentLoaded", () => {
    const formInput = new FormInput();
    formInput.init();
    const loadingState = new LoadingState();
    const searchHistory = new SearchHistory();


    /**
     * Search History
     */
    const historyButton = document.getElementById("historyButton");
    const historyContainer = document.getElementById("historyContainer");
    const historyItems = document.getElementById("historyItems");
    const clearHistory = document.getElementById("clearHistory");

    // History button
    historyButton.addEventListener("click", (event) => {
        event.stopPropagation();
        historyContainer.classList.toggle("visible");
        if (historyContainer.classList.contains('visible')) {
            searchHistory.renderHistory(historyItems);
        }
    });

    // Clear history
    clearHistory.addEventListener("click", (event) => {
        event.stopPropagation();
        searchHistory.clearHistory();
        searchHistory.renderHistory(historyItems);
    });

    // Close history dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!historyContainer.contains(event.target)) {
            historyContainer.classList.remove("visible");
        }
    });

    // History Item Click
    const dropdown = historyContainer.querySelector('.history-dropdown');
    if (dropdown) {
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    searchHistory.setOnItemClick((searchTerm, episode) => {
        // Fill the form with the clicked search
        document.getElementById('englishTitle').value = searchTerm;
        if (episode) {
            document.getElementById('episodeNo').value = episode;
        }

        document.getElementById('searchForm').dispatchEvent(new Event('submit', { cancelable: true }));

        historyContainer.classList.remove('visible');
    });

    /**
     * Search Form
     */
    // Episode number input masking
    const episodeInput = document.getElementById('episodeNo');
    if (episodeInput) {

        episodeInput.placeholder = 'e.g. ep 5';
        // Prevent non-numeric input
        episodeInput.addEventListener('input', (e) => {
            const value = e.target.value;

            if (!value) {
                e.target.value = '';
                return;
            }

            const numericValue = value
                .replace(/\D/g, '')      // Remove non-digits
                .replace(/^0+/, '');     // Remove leading zeros


            if (numericValue !== value) {
                e.target.value = numericValue.slice(0, 3);  // Limit to 3 digits
            }
        });
    }

    // Auto capitalize the title
    const titleInput = document.getElementById('englishTitle');
    if (titleInput) {
        titleInput.addEventListener('input', (e) => {
            // Get current cursor position
            const cursorPosition = e.target.selectionStart;

            e.target.value = toTitleCase(e.target.value);

            // Restore cursor position
            e.target.setSelectionRange(cursorPosition, cursorPosition);
        });
    }


    document.getElementById("searchForm").addEventListener("searchSubmitted", (event) => {
        const { engTitle, episode } = event.detail;
        console.log(`Searching for: ${engTitle}, Episode: ${episode}`);

        searchHistory.addSearch(engTitle, episode);

        if (historyContainer.classList.contains('visible')) {
            searchHistory.renderHistory(historyItems);
        }

        // Show loading state
        loadingState.showLoading();

        // After 3 seconds, show empty state
        setTimeout(() => {
            loadingState
                .stopLoading(
                    true,
                    "No results found soso",
                    "Try a different search term"
                );

            console.log("Showing empty state after loading");
        }, 3000);
    });
});