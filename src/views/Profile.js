import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { Sidebar } from 'components/Profile/SideBar';
import { Controls } from 'components/Profile/Controls';
import { BlogContainer } from 'components/Profile/BlogContainer';

const { getProfileData, getBlogPage, showPostEditor, createBlogPost } = actions.profile;

export const Profile = {
    oninit: ({attrs}) => {
        Promise.all([
            getProfileData(attrs.key),
            getBlogPage(attrs.key, 1)
        ]);
    },

    view: () => {
        const isProfileLoaded = model().profile.user !== null;
        const isBlogLoaded = model().profile.blog.page.pageNo !== null;

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
                        showEditor: model().profile.showEditor,

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
                    username: model().profile.user.username,
                    blog: model().profile.blog
                })
            ])
        ]);
    }
};