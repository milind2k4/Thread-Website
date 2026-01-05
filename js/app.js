// js/app.js
// ============================================================================
// Main front-end script: handles user input, searches r/anime for the episode
// discussion thread, fetches its comments, and renders them.
// The flow is completely unauthenticated – it relies on Reddit's public JSON
// endpoints, which are CORS-enabled for GET requests.
// ============================================================================

// --------------------------- Imports ---------------------------------------
import { FormInput } from "./components/FormInput.js"; // Form UX
import { LoadingState } from "./components/LoadingState.js"; // Loading / results UI
import { SearchHistory } from "./components/SearchHistory.js"; // Local search history
import { toTitleCase } from "./core/Utility.js"; // Small helper
import { RedditSearch } from "./core/RedditSearch.js"; // Service we rewrote
import { JSONParser } from "./core/JSONParser.js"; // Converts Reddit JSON → nested comments
import { CommentRenderer } from "./components/CommentRenderer.js"; // Renders nested comments

// --------------------------- DOM Ready -------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  //--------------------------------------------------------------------------
  // 1. Instantiate helpers / grab DOM nodes
  //--------------------------------------------------------------------------
  const formInput = new FormInput();
  formInput.init();
  const loadingState = new LoadingState();
  const searchHistory = new SearchHistory();
  const reddit = new RedditSearch();

  // Cache frequently-accessed nodes
  const historyBtn = document.getElementById("historyButton");
  const historyWrapper = document.getElementById("historyContainer");
  const historyItems = document.getElementById("historyItems");
  const clearHistoryBtn = document.getElementById("clearHistory");
  const commentContainer = document.getElementById("discussionResults");
  const titleInput = document.getElementById("englishTitle");
  const episodeInput = document.getElementById("episodeNo");
  const searchForm = document.getElementById("searchForm");

  // History dropdown behaviour
  historyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    historyWrapper.classList.toggle("visible");
    if (historyWrapper.classList.contains("visible")) {
      searchHistory.renderHistory(historyItems);
    }
  });

  clearHistoryBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    searchHistory.clearHistory();
    searchHistory.renderHistory(historyItems);
  });

  // Close dropdown when clicking outside of it
  document.addEventListener("click", (e) => {
    if (!historyWrapper.contains(e.target))
      historyWrapper.classList.remove("visible");
  });

  // When a user clicks a previous search, autofill and resubmit
  searchHistory.setOnItemClick((title, ep) => {
    titleInput.value = title;
    episodeInput.value = ep || "";
    searchForm.dispatchEvent(new Event("submit", { cancelable: true }));
    historyWrapper.classList.remove("visible");
  });

  //--------------------------------------------------------------------------
  // 3. Input helpers (masking & auto-capitalisation)
  //--------------------------------------------------------------------------
  // Episode: allow only 1-3 digit numbers (no leading zeros)
  episodeInput.placeholder = "e.g. 5";
  episodeInput.addEventListener("input", (e) => {
    const numeric = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
    if (numeric !== e.target.value) e.target.value = numeric.slice(0, 3);
  });

  // Title: title-case while preserving cursor position
  titleInput.addEventListener("input", (e) => {
    const pos = e.target.selectionStart;
    e.target.value = toTitleCase(e.target.value);
    e.target.setSelectionRange(pos, pos);
  });

  //--------------------------------------------------------------------------
  // 4. Main search handler – FormInput dispatches a custom `searchSubmitted`
  //--------------------------------------------------------------------------
  searchForm.addEventListener("searchSubmitted", async (evt) => {
    const { engTitle, episode } = evt.detail; // Provided by FormInput

    // ---- UI: start spinner & save history
    loadingState.showLoading();
    searchHistory.addSearch(engTitle, episode);
    if (historyWrapper.classList.contains("visible")) {
      searchHistory.renderHistory(historyItems);
    }

    try {
      // -------------------------------------------------------------------
      // 4.1 Search for the discussion thread (top result is usually correct)
      // -------------------------------------------------------------------
      const threads = await reddit.searchThreads(engTitle, episode, 10);
      if (!threads.length) {
        loadingState.stopLoading(
          true,
          "No results",
          "Try a different search term"
        );
        return;
      }

      // Heuristic: If user didn't type "Season", prefer threads that don't satisfy /Season \d+/
      let thread = threads[0];
      const userHasSeason = engTitle.toLowerCase().includes("season");

      if (!userHasSeason) {
        const seasonRegex = /season\s*\d+/i;
        const nonSeasonThreads = threads.filter(
          (t) => !seasonRegex.test(t.title)
        );
        if (nonSeasonThreads.length > 0) {
          thread = nonSeasonThreads[0];
        }
      }

      console.log("Selected thread:", thread);

      const postAndComments = await reddit.fetchPostAndComments(
        thread.permalink
      );
      console.log(postAndComments);

      // -------------------------------------------------------------------
      // 4.2 Fetch full listing (post + comments) – Reddit returns an array
      //     [0]=submission, [1]=comments listing
      // -------------------------------------------------------------------
      const parsedPost = JSONParser.parsePost(postAndComments);
      console.log(parsedPost);

      // -------------------------------------------------------------------
      // 4.3 Render comments (Batch Rendering)
      // -------------------------------------------------------------------

      // State for batch rendering
      const allComments = parsedPost.comments;
      let renderedCount = 0;
      const BATCH_SIZE = 10;

      // Clear container first
      commentContainer.innerHTML = "";

      // Handler for nested "Load More" buttons (API fetch)
      const onLoadMore = async (moreNode, container) => {
        console.log("Loading more comments...", moreNode);
        const linkId = `t3_${parsedPost.id}`;
        const response = await reddit.fetchMoreComments(
          linkId,
          moreNode.children
        );

        const things = response?.json?.data?.things || [];
        if (!things.length) {
          container.innerHTML =
            '<div class="error">No more comments found.</div>';
          return;
        }

        const parsedComments = JSONParser.parseComments({
          data: { children: things },
        });

        container.innerHTML = "";
        const list = document.createElement("div");
        list.className = "replies-list";
        parsedComments.forEach((comment) => {
          list.appendChild(
            CommentRenderer.createCommentElement(
              comment,
              moreNode.depth,
              onLoadMore
            )
          );
        });
        container.appendChild(list);
      };

      // Function to render the next batch of top-level comments
      const renderNextBatch = () => {
        const batch = allComments.slice(
          renderedCount,
          renderedCount + BATCH_SIZE
        );
        if (batch.length === 0) return;

        CommentRenderer.append(commentContainer, batch, onLoadMore);
        renderedCount += batch.length;

        // Handle "Load More Comments" button at the bottom
        let loadMoreBtn = document.getElementById("main-load-more-btn");
        if (loadMoreBtn) loadMoreBtn.remove();

        if (renderedCount < allComments.length) {
          loadMoreBtn = document.createElement("button");
          loadMoreBtn.id = "main-load-more-btn";
          loadMoreBtn.className = "load-more-btn main-load-more";
          loadMoreBtn.textContent = `Load more comments (${
            allComments.length - renderedCount
          } remaining)`;
          loadMoreBtn.style.display = "block";
          loadMoreBtn.style.margin = "20px auto";

          loadMoreBtn.addEventListener("click", () => {
            loadMoreBtn.textContent = "Loading...";
            // Small timeout to allow UI update
            setTimeout(renderNextBatch, 10);
          });

          commentContainer.appendChild(loadMoreBtn);
        }
      };

      // Initial Render
      if (allComments.length === 0) {
        commentContainer.innerHTML =
          '<div class="no-comments">No comments yet</div>';
      } else {
        renderNextBatch();
      }

      loadingState.showResults();
    } catch (err) {
      console.error("Search error", err);
      loadingState.stopLoading(
        true,
        "Error",
        "Could not load comments – please retry."
      );
    }
  });
});
