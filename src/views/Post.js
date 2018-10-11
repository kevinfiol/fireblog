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
const { setPost, updatePostBlogPost, deletePostBlogPost, createPostListener, updatePostBlogTimestamp } = actions.post;

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
            else setPost(null);

            listener = createPostListener(attrs.doc_id, data => {
                // Hacky, shouldn't be accessing profile model
                // We should delete the cache for a post once the post is deleted.
                if (!data && !model().profile.user.username) {
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
                                updatePostBlogTimestamp,
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