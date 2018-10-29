import m from 'mithril';

export const Post = {
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