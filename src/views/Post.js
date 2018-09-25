import m from 'mithril';
import marked from 'marked';
import actions from 'actions';
import { model } from 'state';

const { setPostData, getPost } = actions.post;

export const Post = {
    oninit: ({attrs}) => {
        setPostData({ title: null, date: null, content: null });
        getPost(attrs.key, attrs.pageNo, attrs.postNo);
    },

    view: () => m('.clearfix', [
        model().post.title
            ? m('.clearfix', [
                m('h1', model().post.title),
                m('h3', model().post.date),
                m('p', m.trust( marked( model().post.content ) ))
            ])
            : null
        ,
    ])
};