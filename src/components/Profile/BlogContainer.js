import m from 'mithril';

const Post = {
    view: ({attrs}) => m('.my1', [
        m('h2', [
            m('a.white', {
                oncreate: m.route.link,
                href: `/p/${attrs.post.doc_id}`
            }, attrs.post.title)
        ]),
        m('h3', attrs.post.date)
    ])
};

export const BlogContainer = {
    view: ({attrs}) => [
        attrs.blog.page.posts.length > 0
            ? attrs.blog.page.posts.map(post => m(Post, { post }))
            : m('i', 'User has made no posts.')
        ,
    ]
};