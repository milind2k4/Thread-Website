// js/core/RedditSearch.js
/**
 * Service for searching r/anime episode-discussion threads and loading comments
 * without requiring Reddit OAuth. Uses public JSON endpoints (CORS-enabled).
 */

export class RedditSearch {
    constructor() {
        /** search cache: title|ep -> Thread[] */
        this.cache = new Map();
        /** post cache: id -> post data */
        this.postCache = new Map();
    }

    /**
     * Internal helper – simple GET request to reddit.com returning parsed JSON.
     * @param {string} url fully-qualified reddit URL
     * @returns {Promise<any>} parsed JSON
     */
    async #get(url) {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'ThreadWebsite/1.0 (unauth)' }
        });


        if (!res.ok) throw new Error(`Reddit request failed: ${res.status}`);
        return res.json();
    }

    /**
     * Search r/anime for the episode-discussion thread.
     * @param {string} title   anime title (EN)
     * @param {number|string} episode episode number
     * @param {number} limit   results to return (default 5)
     * @returns {Promise<Thread[]>}
     */
    async searchThreads(title, episode, limit = 5) {
        const key = `${title}|${episode}|${limit}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const query = `"${title}" "Episode ${episode}" discussion`;

        const root = '/reddit';
        const url = `${root}/r/anime/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=relevance&limit=${limit}&type=link`;
        
        const raw = await this.#get(url);
        const threads = this.#parseThreads(raw);
        this.cache.set(key, threads);
        return threads;
    }
    
    /**
     * Fetch raw listing data for a thread.
     * @param {string} permalink reddit url (e.g. https://reddit.com/r/anime/comments/…)
     * @param {number} limit comments to fetch (default 50)
     * @returns {Promise<Array<Post, Comments>}
    */
   async fetchPostAndComments(permalink, limit = 50) {
        const root = '/reddit';
        const url = `${root}${permalink}.json`;
        return this.#get(url);
    }


    /* -------------------------- helpers -------------------------------- */
    #parseThreads(raw) {
        if (!raw?.data?.children) return [];
        return raw.data.children.map(p => ({
            id: p.data.id,
            title: p.data.title,
            author: p.data.author,
            score: p.data.score,
            created: new Date(p.data.created_utc * 1000),
            commentCount: p.data.num_comments,
            permalink: p.data.permalink,
            url: `https://reddit.com${p.data.permalink}`
        }));
    }
}

/**
 * @typedef {Object} Thread
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {number} score
 * @property {Date}   created
 * @property {number} commentCount
 * @property {string} permalink
 * @property {string} url
 */