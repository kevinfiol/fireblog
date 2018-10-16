import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { Comments } from 'components/Comments';
import { Sidebar } from 'components/Profile/SideBar';
import { Controls } from 'components/Profile/Controls';
import { BlogContainer } from 'components/Profile/BlogContainer';
import { Pagination } from 'components/Profile/Pagination';

/**
 * Actions
 */
const { setCache, getCache } = actions.cache;
const { enableEditor } = actions.global;
const {
    setProfile,
    setProfileUser,
    setProfileBlog,
    createProfileBlogPost,
    createProfileBlogComment,
    createProfileBlogListener,
    createProfileUserListener
} = actions.profile;

/**
 * Profile View
 */
export const Profile = () => {
    /**
     * Local State
     */
    let userListener;
    let blogListener;

    return {
        /**
         * Oninit Method
         * @param {Object} attrs View Attributes
         */
        oninit: ({attrs}) => {
            const [profileUsername, pageNo] = attrs.key.split('/');

            const route = m.route.get();
            const cache = getCache(route);

            if (cache) setProfile(cache);
            else setProfile(null);

            userListener = createProfileUserListener(profileUsername, data => {
                if (!data) {
                    m.route.set('/404');
                    return;
                } else if (cache && cache.user) {
                    // If Cache is up to date, Do Nothing
                    const cachedTS = new Date(cache.user.timestamp).getTime();
                    const dataTS = new Date(data.timestamp).getTime();
                    if (cachedTS >= dataTS) return;
                }

                if (!cache) {
                    setCache(route, { user: data });
                    setProfileUser(data);
                } else {
                    cache.user = data;
                    setCache(route, cache);
                    setProfileUser(data);
                }
            });

            blogListener = createProfileBlogListener(profileUsername, pageNo, data => {
                if (!data) {
                    m.route.set('/404');
                    return;
                } else if (cache && cache.blog) {
                    // If Cache is up to date, Do Nothing
                    const cachedTS = new Date(cache.blog.timestamp).getTime();
                    const dataTS = new Date(data.timestamp).getTime();
                    if (cachedTS >= dataTS) return;
                }

                // If page doesn't exist
                if (!data.page) {
                    m.route.set('/u/:username', { username: profileUsername });
                    return;
                }

                const refsToPosts = data.page.posts.map(post => post.data);

                Promise.all( refsToPosts.map(ref => ref.get().then( doc => doc.data() )) )
                    .then(posts => {
                        const blog = data;
                        blog.page.posts = posts;
                        
                        if (!cache) {
                            setCache(route, { blog });
                            setProfileBlog(blog);
                        } else {
                            cache.blog = blog;
                            setCache(route, cache);
                            setProfileBlog(blog);
                        }
                    })
                ;
            });
        },

        onremove: () => {
            userListener();
            blogListener();
        },

        /**
         * View Method
         */
        view: () => {
            /**
             * State
             */
            const globalUser  = model().global.userData;
            const showEditor  = model().global.showEditor;

            const profileUser  = model().profile.user;
            const blog         = model().profile.blog;
            const pageNo       = model().profile.blog.page.pageNo;
            const pageNos      = model().profile.blog.pageNos;
            const pageLength   = model().profile.blog.pageNos.length;
            const blogComments = model().profile.blog.comments;

            /**
             * Computed
             */
            const isUserLoggedIn       = globalUser.username !== null;
            const isProfileLoaded      = profileUser.username !== null;
            const isBlogLoaded         = pageNo !== null && pageLength > 0;
            const isGlobalUsersProfile = profileUser.username === globalUser.username;

            /**
             * View
             */
            return m('.clearfix', [
                isProfileLoaded
                    ? m('.col.col-12', [
                        m(Sidebar, {
                            // State
                            user: profileUser
                        })
                    ])
                    : null
                ,

                m('.col.col-12.my2', { style: { height: '36px' } }, [
                    isGlobalUsersProfile && isProfileLoaded
                        ? m(Controls, {
                            // State
                            username: globalUser.username,
                            showEditor,

                            // Actions
                            createProfileBlogPost,
                            enableEditor
                        })
                        : null
                    ,
                ]),

                isBlogLoaded
                    ? [
                        m('.col.col-12', [
                            m(BlogContainer, {
                                // State
                                blog
                            })
                        ]),

                        m('.col.col-12.mt2', [
                            m(Pagination, {
                                // State
                                username: profileUser.username,
                                currentPage: pageNo,
                                pageNos
                            })
                        ])
                    ]
                    : null
                ,

                isUserLoggedIn
                    ? m('.col.col-12', [
                        m(Comments, {
                            // State
                            globalUsername: globalUser.username,
                            identifier: profileUser.username,
                            comments: blogComments,

                            // Actions
                            createComment: createProfileBlogComment
                        })
                    ])
                    : null
                ,
            ]);
        }
    };

};