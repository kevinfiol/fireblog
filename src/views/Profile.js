import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
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
    getProfileUser,
    getProfileBlogTimestamp,
    getProfileBlogPage,
    getProfileBlogPageNos,
    createProfileBlogPost,

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
            const profileUsername = attrs.username;
            const pageNo = attrs.key;

            const route = m.route.get();
            const cache = getCache(route);
            if (cache) setProfile(cache);

            userListener = createProfileUserListener(profileUsername, data => {
                console.log(data);
            });

            blogListener = createProfileBlogListener(profileUsername, data => {
                // For this make sure you check for the page number
                // Also, you still have to update the blog timestamp 'on Post update'
                console.log(data);
            });

            // Promise.all([
            //     getProfileUser(profileUsername),
            //     getProfileBlogTimestamp(profileUsername),
            //     getProfileBlogPage(profileUsername, pageNo),
            //     getProfileBlogPageNos(profileUsername)
            // ]);

            // const route = m.route.get();
            // const cache = getCache(route);

            // if (cache) {
            //     setProfile(cache);
            // } else {
            //     const profileUsername = attrs.username;
            //     const pageNo = attrs.key;
        
            //     Promise.all([
            //         getProfileUser(profileUsername),
            //         getProfileBlogPage(profileUsername, pageNo),
            //         getProfileBlogPageNos(profileUsername)
            //     ]).then(() => {
            //         setCache(route, model().profile);
            //     });
            // }
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

            const profileUser = model().profile.user;
            const blog        = model().profile.blog;
            const pageNo      = model().profile.blog.page.pageNo;
            const pageNos     = model().profile.blog.pageNos;
            const pageLength  = model().profile.blog.pageNos.length;

            /**
             * Computed
             */
            const isProfileLoaded      = profileUser.uid !== null;
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

                isGlobalUsersProfile && isProfileLoaded
                    ? m('.col.col-12.mt2', [
                        m(Controls, {
                            // State
                            username: globalUser.username,
                            blog,
                            showEditor,

                            // Actions
                            createProfileBlogPost,
                            getProfileBlogPage,
                            getProfileBlogPageNos,
                            enableEditor
                        })
                    ])
                    : null
                ,

                isBlogLoaded
                    ? [
                        m('.col.col-12.mt2', [
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
            ]);
        }
    };

};