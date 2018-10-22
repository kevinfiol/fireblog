import m from 'mithril';
import { EmptyState } from 'components/EmptyState';

/**
 * BlogContainer Post Subcomponent
 */
const Post = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => m('.my2', [
        m('span', [
            m('.h5.inline.light-subdue', attrs.post.date),
            m('span.inline.light-subdue.px1', '•'),
            m('a.h2.inline', {
                oncreate: m.route.link,
                href: `/p/${attrs.post.doc_id}`
            }, attrs.post.title)
        ])
    ])
};

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