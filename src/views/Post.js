import m from 'mithril';
import marked from 'marked';
import actions from 'actions';
import { model } from 'state';
import { RENDERER } from 'config';
// import { imgObserver } from 'observers';
import { EmptyState } from 'components/EmptyState';
import { Comments } from 'components/Comments';
import { Controls } from 'components/Post/Controls';

// Set Marked Renderer
marked.setOptions({ renderer: RENDERER, sanitize: true });

/**
 * Actions
 */
const { setCache, getCache, removeCache } = actions.cache;
const { enableEditor } = actions.global;
const {
    getPost,
    setPost,
    updatePost,
    deletePost,
    createPostListener,
    createPostComment,
    deletePostComment,
    updateBlogTimestamp
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
                document.title = model().post.title;
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
                document.title = model().post.title;

                m.redraw();
            });
        },

        // /**
        //  * Onupdate Method
        //  */
        // onupdate: () => {
        //     // Observe for .lazy-load images
        //     imgObserver.observe();
        // },

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
            const showControls        = isUserLoggedIn && (globalUsername === postUsername);

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
                            updateBlogTimestamp,
                            deletePost,
                            enableEditor,
                            updatePost,
                        })
                        : null
                    ,
                ]),

                isPostDataLoaded
                    ? [
                        m('h1', title),
                        m('.h4', [
                            m('span.light-subdue', 'by '),
                            m('a', { oncreate: m.route.link, href: `/u/${postUsername}` }, postUsername)
                        ]),
                        m('.h5.light-subdue', date),
                        m('p', content
                            ? m.trust( marked( content ) )
                            : m(EmptyState, 'This post has no content yet.')
                        )
                    ]
                    : null
                ,

                isPostDataLoaded
                    ? [
                        m('.col.col-12', m('hr')),

                        m('h4', { style: { margin: '0' } }, 'comments'),

                        m(Comments, {
                            // State
                            isUserLoggedIn,
                            globalUsername,
                            identifier: doc_id,
                            comments,
        
                            // Actions
                            createComment: createPostComment,
                            deleteComment: deletePostComment
                        })
                    ]
                    : null
                ,
            ];
        }
    };
};