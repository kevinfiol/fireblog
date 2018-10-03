import m from 'mithril';

/**
 * BlogContainer Post Subcomponent
 */
const Post = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => m('.my1', [
        m('h2', [
            m('a.charcoal', {
                oncreate: m.route.link,
                href: `/p/${attrs.post.doc_id}`
            }, attrs.post.title)
        ]),
        m('h3', attrs.post.date)
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
                : m('i', 'User has made no posts.')
            ,
        ];
    }
};