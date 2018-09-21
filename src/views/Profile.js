import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { Sidebar } from 'components/Profile/SideBar';
import { BlogContainer } from 'components/Profile/BlogContainer';

const { getProfileData, getBlogPage } = actions.profile;

export const Profile = {
    oninit: ({attrs}) => {
        Promise.all([
            getProfileData(attrs.key),
            getBlogPage(attrs.key, 0)
        ]);
    },

    view: () => {
        const isProfileLoaded = model().profile.user !== null;
        const isBlogLoaded = model().profile.blog.page.pageNo !== null;

        if (!isProfileLoaded || !isBlogLoaded) return null;

        return m('.clearfix', [
            m('.col.col-12.md-col-3.px1', [
                m(Sidebar, {
                    // State
                    user: model().profile.user
                })
            ]),
    
            m('.col.col-12.md-col-9.px4.my3', [
                m(BlogContainer, {
                    // State
                    blog: model().profile.blog
                })
            ])
        ]);
    }
};