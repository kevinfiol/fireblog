import m from 'mithril';
import marked from 'marked';
import actions from 'actions';
import { model } from 'state';
import { Controls } from 'components/Post/Controls';

/**
 * Actions
 */
const { setCache, getCache } = actions.cache;
const { enableEditor } = actions.global;
const { setPost, updatePostBlogPost, deletePostBlogPost, createPostListener } = actions.post;

/**
 * Post View
 */
export const Post = () => {
    /**
     * Local State
     */
    let listener;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            const route = m.route.get();
            const cache = getCache(route);
            if (cache) setPost(cache);

            listener = createPostListener(attrs.doc_id, data => {
                if (!cache) {
                    setCache(route, data);
                    setPost(data);
                } else {
                    const cachedTS = new Date(cache.timestamp).getTime();
                    const dataTS = new Date(data.timestamp).getTime();

                    if (dataTS > cachedTS) {
                        setCache(route, data);
                        setPost(data);
                    }
                }
            });
        },

        onremove: () => {
            // Detach Listener
            listener();
        },

        /**
         * View Method
         */
        view: () => {
            /**
             * State Variables
             */
            const username     = model().global.userData.username;
            const showEditor   = model().global.showEditor;

            const postUsername = model().post.username;
            const doc_id       = model().post.doc_id;
            const title        = model().post.title;
            const date         = model().post.date;
            const content      = model().post.content;

            /**
             * Computed
             */
            const isPostDataLoaded    = title !== null;
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
                                deletePostBlogPost,
                                enableEditor,
                                updatePostBlogPost,
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
};