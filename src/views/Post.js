import m from 'mithril';
import marked from 'marked';
import actions from 'actions';
import { model } from 'state';
import { Controls } from 'components/Post/Controls';

const { showPostEditor } = actions.global;
const { setPostData, getPost, updateBlogPost } = actions.post;

export const Post = {
    oninit: ({attrs}) => {
        setPostData({
            doc_id: null,
            username: null,
            title: null,
            date: null,
            content: null
        });
        
        getPost(attrs.doc_id);
    },

    view: () => m('.clearfix', [
        model().post.title
            ? m('.clearfix', [
                model().global.userData.username === model().post.username
                    ? m(Controls, {
                        // State
                        showEditor: model().global.showEditor,
                        username: model().global.username,
                        title: model().post.title,
                        content: model().post.content,
                        doc_id: model().post.doc_id,

                        // Actions
                        showPostEditor,
                        updateBlogPost,
                        setPostData,
                        getPost
                    })
                    : null
                ,
                
                m('h1', model().post.title),
                m('h3', m('a', { oncreate: m.route.link, href: `/u/${model().post.username}` }, model().post.username)),
                m('h3', model().post.date),
                m('p', m.trust( marked( model().post.content ) ))
            ])
            : null
        ,
    ])
};