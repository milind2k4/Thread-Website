// js/core/RedditSearch.js
/**
 * Service for searching r/anime episode-discussion threads and loading comments
 * without requiring Reddit OAuth. Uses public JSON endpoints (CORS-enabled).
 */

export class RedditSearch {
  constructor() {
    /** search cache: title|ep -> Thread[] */
    this.cache = new Map();
  }

  /**
   * Internal helper – simple GET request to reddit.com returning parsed JSON.
   * @param {string} url fully-qualified reddit URL
   * @returns {Promise<any>} parsed JSON
   */
  async #get(url) {
    const res = await fetch(url, {
      headers: { "User-Agent": "ThreadWebsite/1.0 (unauth)" },
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

    const root = "/reddit";
    const url = `${root}/r/anime/search.json?q=${encodeURIComponent(
      query
    )}&restrict_sr=on&sort=relevance&limit=${limit}&type=link`;

    const raw = await this.#get(url);
    const threads = this.#parseThreads(raw);
    this.cache.set(key, threads);
    return threads;
  }

  /**
   * Fetch raw listing data for a thread.
   * @param {string} permalink reddit url (e.g. https://reddit.com/r/anime/comments/…)
   * @returns {Promise<Array>} [postObject, commentsArray]
   */
  async fetchPostAndComments(permalink) {
    // We append .json to get the raw data
    // We can also add ?sort=confidence (default) or ?limit=500
    const url = `/reddit${permalink}.json?limit=500`;
    return this.#get(url);
  }

  /**
   * Fetch more comments (pagination)
   * @param {string} linkId - The full name of the link (e.g. t3_xxxxx)
   * @param {Array<string>} children - Array of comment IDs to fetch
   * @returns {Promise<Object>} The raw JSON response
   */
  async fetchMoreComments(linkId, children) {
    // /api/morechildren requires comma-separated list of children
    // We limit to 100 at a time to be safe
    const ids = children.slice(0, 100).join(",");
    const url = `/reddit/api/morechildren.json?link_id=${linkId}&children=${ids}&api_type=json`;
    return this.#get(url);
  }

  /* -------------------------- helpers -------------------------------- */
  #parseThreads(raw) {
    if (!raw?.data?.children) return [];
    return raw.data.children.map((p) => ({
      id: p.data.id,
      title: p.data.title,
      author: p.data.author,
      score: p.data.score,
      created: new Date(p.data.created_utc * 1000),
      commentCount: p.data.num_comments,
      permalink: p.data.permalink,
      url: `https://reddit.com${p.data.permalink}`,
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
