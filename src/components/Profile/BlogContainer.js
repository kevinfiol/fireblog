import m from 'mithril';
import marked from 'marked';

const Post = {
    view: ({attrs}) => m('.my1', [
        m('h2', attrs.title),
        m('div', m.trust( marked( attrs.content ) ))
    ])
};

export const BlogContainer = {
    view: ({attrs}) => m('div', [
        attrs.blog.page.posts.length
            ? attrs.blog.page.posts.map(post => {
                return m(Post, { title: post.title, content: post.content });
            })
            : m('p', 'User has made no posts.')
        ,
    ])
};