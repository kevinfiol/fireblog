import m from 'mithril';
import { model } from 'state';
import { ProfileForm } from 'components/Settings/ProfileForm';

export const Settings = {
    oninit() {
        // If not signed in, redirect to dash
        if (!model().global.user) m.route.set('/');
    },

    view() {
        return m('.clearfix', [
            model().global.user
                ? m(ProfileForm, { user: model().global.user })
                // ? m(Profile, { user: model().global.user })
                : m('p', 'not logged in')
            ,
        ]);
    }
};