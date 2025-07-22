/**
 * Parses Reddit comment threads into a nestes structure
 */
export class PostParser {
    /**
     * Parse a Reddit post's comments into a nested structure
     * @param {Object} postData - The Reddit API response for a post
     * @returns {Object} Parsed post with nested comments
     */
    static parsePost(postData) {
        if (!Array.isArray(postData) || postData.length < 2) {
            throw new Error('Invalid post structure');
        }

        const post = postData[0]?.data?.children[0]?.data;
        
        return {
            id: post.id,
            title: post.title,
            author: post.author,
            score: post.score,
            created: new Date(post.created_utc * 1000),
            url: `https://reddit.com${post.permalink}`,
            commentCount: post.num_comments,
            comments: this.parseComments(postData[1])
        };
    }

    /**
     * Parse Reddit comments into a nested structure
     * @param {Object} commentsData - The comments data from Reddit API
     * @returns {Array} Array of top-level comments with nested replies
     */
    static parseComments(commentsData) {
        if (!commentsData?.data?.children) return [];
        
        return commentsData.data.children
            .filter(child => child.kind === 't1') // t1 is a comment
            .map(node => this.parseCommentNode(node))
            .filter(Boolean); // Remove any null/undefined comments
    }

    static parseCommentNode(node, depth = 0) {
        if (!node?.data || !(node.kind === "t1" || node.kind === "more")) return null;
    
        const comment = node.data;
        return {
          id: comment.id,
          author: comment.author,
          score: comment.score,
          awards: this.parseAwards(comment.all_awardings || []),
          created: new Date(comment.created_utc * 1000),
          depth: depth,
          content: comment.body_html ? this.decodeHtml(comment.body_html) : '',
          replies:
            comment.replies?.data?.children
              ?.map((reply) => this.parseCommentNode(reply, depth + 1))
              .filter(Boolean) || [],
        };
      }

    /**
     * Parse a single comment and its replies
     * @private
     * @param {Object} commentData - The comment data
     * @returns {Object|null} Parsed comment or null if deleted/removed
     */
    static parseComment(commentData) {
        // Process replies if they exist
        let replies = [];
        if (commentData.replies && 
            typeof commentData.replies === 'object' && 
            commentData.replies.data) {
            replies = this.parseComments(commentData.replies.data);
        }

        return {
            id: commentData.id,
            author: commentData.author,
            score: commentData.score,
            awards: this.parseAwards(commentData.all_awardings || []),
            created: new Date(commentData.created_utc * 1000),
            depth: commentData.depth || 0,
            content: this.decodeHtml(commentData.body_html || ''),
            replies: replies
        };
    }

    /**
     * Parse awards data
     * @private
     */
    static parseAwards(awards) {
        if (!Array.isArray(awards)) return [];
        
        return awards.map(award => ({
            id: award.id,
            name: award.name,
            iconUrl: award.icon_url,
            count: award.count
        }));
    }

    /**
     * Decode HTML entities in text
     * @param {string} html - HTML string to decode
     * @returns {string} Decoded text
     * @private
     */
    static decodeHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
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
