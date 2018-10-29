import m from 'mithril';
import { Post } from 'components/Profile/BlogContainer/Post';
import { EmptyState } from 'components/EmptyState';

/**
 * Profile BlogContainer Component
 */
export const BlogContainer = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => {
        /**
         * State
         */
        const blog = attrs.blog;

        /**
         * View
         */
        return [
            blog.page.posts.length > 0
                ? blog.page.posts.map(post => m(Post, { post }))
                : m(EmptyState, 'User has made no posts.')
            ,
        ];
    }
};