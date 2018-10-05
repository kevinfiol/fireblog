import m from 'mithril';
import marked from 'marked';
import actions from 'actions';
import { model } from 'state';
import { Controls } from 'components/Post/Controls';

/**
 * Actions
 */
const { enableEditor } = actions.global;
const { setPostData, getPost, updateBlogPost, deleteBlogPost } = actions.post;

/**
 * Post View
 */
export const Post = {
    /**
     * Oninit Method
     * @param {Object} attrs View Attributes
     */
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

    /**
     * View Method
     */
    view: () => {
        /**
         * State Variables
         */
        const username = model().global.userData.username;
        const showEditor = model().global.showEditor;

        const postUsername = model().post.username;
        const doc_id = model().post.doc_id;
        const title = model().post.title;
        const date = model().post.date;
        const content = model().post.content;

        /**
         * Computed
         */
        const isPostDataLoaded = title !== null;
        const isSignedInUsersPost = username === postUsername;

        /**
         * View
         */
        return m('.clearfix', [
            isPostDataLoaded
                ? m('.clearfix', [
                    isSignedInUsersPost
                        ? m(Controls, {
                            // State
                            showEditor,
                            username,
                            title,
                            content,
                            doc_id,
    
                            // Actions
                            deleteBlogPost,
                            enableEditor,
                            updateBlogPost,
                            setPostData,
                            getPost
                        })
                        : null
                    ,
                    
                    m('h1', title),
                    m('.h4', [
                        m('span.muted', 'by '),
                        m('a', { oncreate: m.route.link, href: `/u/${postUsername}` }, postUsername)
                    ]),
                    m('.h5.muted', date),
                    m('p', m.trust( marked( content ) ))
                ])
                : null
            ,
        ]);
    }
};