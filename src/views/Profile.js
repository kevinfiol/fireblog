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
const { showPostEditor } = actions.global;
const { getProfileData, getBlogPage, getBlogPageNumbers, createBlogPost } = actions.profile;

/**
 * Profile View
 */
export const Profile = {
    /**
     * Oninit Method
     * @param {Object} attrs View Attributes
     */
    oninit: ({attrs}) => {
        console.log('init profile');
        const username = attrs.key;

        Promise.all([
            getBlogPageNumbers(username),
            getProfileData(username),
            getBlogPage(username, 1)
        ]);
    },

    /**
     * View Method
     */
    view: () => {
        console.log('show view'); // this is triggering infinitely, solve this
        /**
         * State
         */
        const globalUser = model().global.userData;
        const showEditor = model().global.showEditor;

        const profileUser = model().profile.user;
        const blog = model().profile.blog;
        const pageNo = model().profile.blog.page.pageNo;
        const pageNos = model().profile.blog.pageNos;
        const pageLength = model().profile.blog.pageNos.length;

        /**
         * Computed
         */
        const isProfileLoaded = profileUser.uid !== null;
        const isBlogLoaded = pageNo !== null && pageLength > 0;
        const isGlobalUsersProfile = profileUser.username === globalUser.username;

        /**
         * View
         */
        if (!isProfileLoaded || !isBlogLoaded)
            return null;

        return m('.clearfix', [
            m('.col.col-12', [
                m(Sidebar, {
                    // State
                    user: profileUser
                })
            ]),

            isGlobalUsersProfile
                ? m('.col.col-12.mt2', [
                    m(Controls, {
                        // State
                        username: globalUser.username,
                        blog,
                        showEditor,

                        // Actions
                        createBlogPost,
                        getBlogPage,
                        showPostEditor
                    })
                ])
                : null
            ,

            m('.col.col-12.mt2', [
                m(BlogContainer, {
                    // State
                    blog
                }),

                m(Pagination, {
                    // State
                    username: profileUser.username,
                    currentPage: pageNo,
                    pageNos,

                    // Actions
                    getBlogPage
                })
            ])
        ]);
    }
};