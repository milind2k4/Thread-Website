/**
 * Parses Reddit JSON into a nested structure
 */
export class JSONParser {
  /**
   * Parse a Reddit post's comments into a nested structure
   * @param {Array<Object (Post), Object (Comments)>} raw - The Reddit API response for a post
   * @returns {Object} Parsed post with nested comments
   */
  static parsePost(raw) {
    if (!Array.isArray(raw) || raw.length < 2) {
      throw new Error("Invalid post structure");
    }

    const post = raw[0]?.data?.children[0]?.data;

    return {
      id: post.id,
      title: post.title,
      author: post.author,
      score: post.score,
      created: new Date(post.created_utc * 1000),
      url: `https://reddit.com${post.permalink}`,
      commentCount: post.num_comments,
      comments: this.parseComments(raw[1]),
    };
  }

  /**
   * Parse Reddit comments into a nested structure
   * @param {Object} commentsData - The comments data from Reddit API
   * @returns {Array} Array of top-level comments with nested replies
   */
  static parseComments(commentsData) {
    if (!commentsData?.data?.children) return [];

    return (
      commentsData.data.children
        .filter((child) => child.kind === "t1") // t1 is a comment
        //TODO: Implement Source Material Corner
        .slice(1) // Remove the first comment (AutoModerator, Source Material Corner)
        .map((node) => this.parseCommentNode(node))
        .filter(Boolean)
    ); // Remove any null/undefined comments
  }

  static parseCommentNode(node, depth = 0) {
    if (!node?.data || !(node.kind === "t1" || node.kind === "more"))
      return null;

    const comment = node.data;
    return {
      id: comment.id,
      author: comment.author,
      score: comment.score,
      created: new Date(comment.created_utc * 1000),
      depth: depth,
      content: comment.body_html ? this.decodeHtml(comment.body_html) : "",
      replies:
        comment.replies?.data?.children
          ?.map((reply) => this.parseCommentNode(reply, depth + 1))
          .filter(Boolean) || [],
    };
  }

  /**
   * Parse awards data
   * @private
   */
  //TODO: Implement Awards
  static parseAwards(awards) {
    if (!Array.isArray(awards)) return [];

    return awards.map((award) => ({
      id: award.id,
      name: award.name,
      iconUrl: award.icon_url,
      count: award.count,
    }));
  }

  /**
   * Decode HTML entities in text
   * @param {string} html - HTML string to decode
   * @returns {string} Decoded text
   * @private
   */
  static decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
  }
}

/**
 * Type Definitions for Documentation
 */

/**
 * Reddit Post
 * @typedef {Object} Post
 * @property {string} id - Post ID
 * @property {string} title - Post title
 * @property {string} author - Post author
 * @property {string} content - Post content
 * @property {number} score - Post score
 * @property {Date} created - Post creation date
 * @property {string} url - Post URL
 * @property {number} commentCount - Number of comments
 * @property {Array<Comment>} comments - Array of comments
 */

/**
 * Reddit Comment
 * @typedef {Object} Comment
 * @property {string} id - Comment ID
 * @property {string} author - Comment author
 * @property {number} score - Comment score
 * @property {Date} created - Comment creation date
 * @property {number} depth - Comment depth
 * @property {Array<Award>} awards - Array of awards
 * @property {string} content - Comment content
 * @property {Array<Comment>} replies - Array of replies
 */

/**
 * Reddit Award
 * @typedef {Object} Award
 * @property {string} id - Award ID
 * @property {string} name - Award name
 * @property {string} iconUrl - Award icon URL
 * @property {number} count - Award count
 */
