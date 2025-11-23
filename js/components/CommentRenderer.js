/**
 * CommentRenderer Component
 * Renders nested comments to the DOM
 */
export class CommentRenderer {
    /**
     * Render nested comments to the DOM
     * @param {HTMLElement} container - Where to render the comments
     * @param {Array} comments - Array of parsed comment objects
     */
    static render(container, comments) {
        if (!comments || !comments.length) {
            container.innerHTML = '<div class="no-comments">No comments yet</div>';
            return;
        }

        container.innerHTML = ''; // Clear existing content
        const list = document.createElement('div');
        list.className = 'comments-list';
        
        comments.forEach(comment => {
            list.appendChild(this.createCommentElement(comment));
        });
        
        container.appendChild(list);
    }

    /**
     * Create a single comment element
     * @param {Object} comment - The comment to render
     * @param {number} depth - The depth of the comment in the thread
     * @returns {HTMLElement} The comment element
     */
    static createCommentElement(comment, depth = 0) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        commentEl.style.marginLeft = `${depth * 20}px`; // Indent based on depth
        commentEl.dataset.depth = depth;
        commentEl.dataset.commentId = comment.id;

        // Comment header (author, points, time ago)
        const header = document.createElement('section');
        header.className = 'comment-header';
        header.innerHTML = `
            <span class="comment-author">${comment.author}</span>
            <span class="comment-points">${comment.score} points</span>
            <span class="comment-time">${this.formatTime(comment.created)}</span>
        `;

        // Comment body
        const body = document.createElement('section');
        body.className = 'comment-body';
        body.innerHTML = comment.content || '[deleted]';

        // Replies container
        const replies = document.createElement('section');
        replies.className = 'comment-replies';

        // Add elements to comment
        commentEl.appendChild(header);
        commentEl.appendChild(body);
        
        // Recursively add replies if they exist
        if (comment.replies && comment.replies.length > 0) {
            const repliesList = document.createElement('div');
            repliesList.className = 'replies-list';
            comment.replies.forEach(reply => {
                repliesList.appendChild(this.createCommentElement(reply, depth + 1));
            });
            replies.appendChild(repliesList);
            commentEl.appendChild(replies);
        }

        return commentEl;
    }

    /**
     * Format timestamp to relative time (e.g., "2 hours ago")
     * @param {Date} timestamp - The timestamp to format
     * @returns {string} The formatted time
     * @private
     */
    static formatTime(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        let interval = Math.floor(seconds / 31536000);
        
        if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
        return 'just now';
    }
}