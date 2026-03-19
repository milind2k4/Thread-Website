// js/tests/RedditSearch.test.js
// Run with:   node js/tests/RedditSearch.test.js
// ---------------------------------------------------------------------------
import { RedditSearch } from '../core/RedditSearch.js';
import { JSONParser } from '../core/JSONParser.js';

// --------------------------- Test -----------------------------------------
(async () => {
    try {
        const reddit = new RedditSearch();

        // 1. Search for threads
        const threads = await reddit.searchThreads('Secrets of the Silent Witch', 12, 1);
        if (!threads.length) throw new Error('No threads found');

        // console.log('Found thread:\n', await reddit.fetchRawListing(threads[0].url));
        console.log( await reddit.fetchPostAndComments(threads[0].url))

    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
})();
