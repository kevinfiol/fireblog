import m from 'mithril';

const Post = {
    view: ({attrs}) => m('.my1', [
        m('h2', [
            m('a.white', {
                oncreate: m.route.link,
                href: `/u/${attrs.username}/blog/${attrs.post.pageNo}/${attrs.post.postNo}`
            }, attrs.post.title)
        ]),
        m('h3', attrs.post.date)
    ])
};

export const BlogContainer = () => {
    let username = null;
    let blog = null;
    let page = null;
    let posts = null;

    return {
        oninit: ({attrs}) => {
            username = attrs.username;
            blog = attrs.blog;
            page = attrs.blog.page;
            posts = [...blog.page.posts];

            if (posts.length > 0) {
                for (let i = 0; i < posts.length; i++) {
                    posts[i].pageNo = page.pageNo;
                    posts[i].postNo = i;
                }
            }
        },

        view: () => [
            posts.length > 0
                ? posts.map(post => m(Post, { post, username }))
                : m('p', 'User has made no posts.')
            ,
        ]
    };
};