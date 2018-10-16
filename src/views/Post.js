import m from 'mithril';
import marked from 'marked';
import actions from 'actions';
import { model } from 'state';
import { Comments } from 'components/Comments';
import { Controls } from 'components/Post/Controls';

/**
 * Actions
 */
const { setCache, getCache, removeCache } = actions.cache;
const { enableEditor } = actions.global;
const {
    getPost,
    setPost,
    updatePostBlogPost,
    deletePostBlogPost,
    createPostListener,
    createPostComment,
    updatePostBlogTimestamp
} = actions.post;

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

            if (cache) {
                setPost(cache);
            } else {
                setPost(null);
                getPost(attrs.doc_id);
            }

            listener = createPostListener(attrs.doc_id, data => {
                if (!data) {
                    m.route.set('/404');
                    return;
                }

                if (cache) {
                    const cachedTS = new Date(cache.timestamp).getTime();
                    const dataTS = new Date(data.timestamp).getTime();
                    if (cachedTS >= dataTS) return;
                }

                setCache(route, data);
                setPost(data);
            });
        },

        /**
         * Onremove Method
         */
        onremove: () => {
            listener();
        },

        /**
         * View Method
         */
        view: () => {
            /**
             * State
             */
            const globalUsername = model().global.userData.username;
            const showEditor     = model().global.showEditor;

            const postUsername   = model().post.username;
            const doc_id         = model().post.doc_id;
            const title          = model().post.title;
            const date           = model().post.date;
            const content        = model().post.content;
            const comments       = model().post.comments;

            /**
             * Computed
             */
            const isUserLoggedIn      = globalUsername !== null;
            const isPostDataLoaded    = title !== null;
            const showControls        = globalUsername === postUsername;

            /**
             * View
             */
            return [
                m('div', { style: { height: '36px' } }, [
                    showControls
                        ? m(Controls, {
                            // State
                            username: globalUsername,
                            showEditor,
                            title,
                            content,
                            doc_id,

                            // Actions
                            removeCache,
                            updatePostBlogTimestamp,
                            deletePostBlogPost,
                            enableEditor,
                            updatePostBlogPost,
                        })
                        : null
                    ,
                ]),

                isPostDataLoaded
                    ? [
                        m('h1', title),
                        m('.h4', [
                            m('span.muted', 'by '),
                            m('a', { oncreate: m.route.link, href: `/u/${postUsername}` }, postUsername)
                        ]),
                        m('.h5.muted', date),
                        m('p', m.trust( marked( content ) ))
                    ]
                    : null
                ,

                isUserLoggedIn
                    ? m(Comments, {
                        // State
                        globalUsername,
                        identifier: doc_id,
                        comments,

                        // Actions
                        createComment: createPostComment
                    })
                    : null
                ,
            ];
        }
    };
};