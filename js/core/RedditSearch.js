/**
 * Sevice for searching Reddit threads
 */

export class RedditSearch {
    constructor() {
        this.baseURL = 'https://www.reddit.com/r/anime/search.json';
        this.cache = new Map()
    }

    /**
     * Search Reddit for anime discussion threads
     * @param {string} title - Anime title
     * @param {number} episode - Episode number
     * @param {string} [sort='relevance'] - Sort method: 'relevance', 'new', 'top', 'comments'
     * @returns {Promise<Array<Post>>} Array of matching threads
     */
    async searchThread(title, episode, sort = 'relevance') {
        const cacheKey = `${title}-${episode}-${sort}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const query = `${title} - "Episode ${episode}" discussion author:AutoLovepon`

            const url = new URL(this.baseURL);
            url.searchParams.append('q', query);
            url.searchParams.append('restrict_sr', 'on');
            url.searchParams.append('sort', sort);
            url.searchParams.append('limit', '10');
            url.searchParams.append('type', 'link');

            const response = await fetch(url.toString());

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const threads = this.#processRedditResponse(data);

            this.cache.set(cacheKey, threads);
            // console.log(`Search URL: ${url.toString()}`);

            return threads;

        } catch (error){
            console.error('Error searching Reddit:', error);
            throw new Error('Failed to search Reddit');
        }
    }


    /**
     * Process Reddit response data
     * @private
     * @param {Object} response - Reddit API response
     * @returns {Array} Array of processed threads
     */
    #processRedditResponse(response) {
        if (!response?.data?.children) return [];
        
        return response.data.children
            .map(post => ({
                id: post.data.id,
                title: post.data.title,
                author: post.data.author,
                score: post.data.score,
                created: new Date(post.data.created_utc * 1000),
                commentCount: post.data.num_comments,
                url: `https://reddit.com${post.data.permalink}`,
            }));
    }
}


/**
 * Type Definitions for Documentation
 */

/**
 * Reddit Thread
 * @typedef {Object} Thread
 * @property {string} id - Thread ID
 * @property {string} title - Thread title
 * @property {string} author - Thread author
 * @property {number} score - Thread score
 * @property {Date} created - Thread creation date
 * @property {number} commentCount - Number of comments
 * @property {string} url - Thread URL
 */