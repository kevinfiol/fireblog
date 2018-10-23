import m from 'mithril';

/**
 * Dashboard Post Component
 */
export const Post = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => [
        m('a.h2.inline', {
            oncreate: m.route.link,
            href: `/p/${attrs.post.doc_id}`
        }, attrs.post.title),

        m('.h4', [
            m('span.light-subdue', 'by '),
            m('a', {
                oncreate: m.route.link,
                href: `/u/${attrs.post.username}`
            }, attrs.post.username)
        ]),

        m('.h5.light-subdue', attrs.post.date)
    ]
};