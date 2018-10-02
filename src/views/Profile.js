import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { Sidebar } from 'components/Profile/SideBar';
import { Controls } from 'components/Profile/Controls';
import { BlogContainer } from 'components/Profile/BlogContainer';
import { Pagination } from 'components/Profile/Pagination';

const { showPostEditor } = actions.global;
const { getProfileData, getBlogPage, getBlogPageNumbers, createBlogPost } = actions.profile;

export const Profile = {
    oninit: ({attrs}) => {
        const username = attrs.key;

        Promise.all([
            getBlogPageNumbers(username),
            getProfileData(username),
            getBlogPage(username, 1)
        ]);
    },

    view: () => {
        const isProfileLoaded = model().profile.user !== null;
        const isBlogLoaded = model().profile.blog.page.pageNo !== null && model().profile.blog.pageNos.length > 0;

        if (!isProfileLoaded || !isBlogLoaded) return null;
        const isUsersProfile = model().profile.user.username === model().global.userData.username;

        return m('.clearfix', [
            m('.col.col-12', [
                m(Sidebar, {
                    // State
                    user: model().profile.user
                })
            ]),

            isUsersProfile
                ? m('.col.col-12.mt2', [
                    m(Controls, {
                        // State
                        username: model().global.userData.username,
                        blog: model().profile.blog,
                        showEditor: model().global.showEditor,

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
                    blog: model().profile.blog
                }),

                m(Pagination, {
                    // State
                    username: model().profile.user.username,
                    currentPage: model().profile.blog.page.pageNo,
                    pageNos: model().profile.blog.pageNos,

                    // Actions
                    getBlogPage
                })
            ])
        ]);
    }
};