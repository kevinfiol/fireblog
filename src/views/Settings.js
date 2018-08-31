import m from 'mithril';
import { model } from 'state';
import { ProfileForm } from 'components/Settings/ProfileForm';

export const Settings = {
    oninit() {
        // If not signed in, redirect to dash
        if (!model().global.firebaseUser) m.route.set('/');
    },

    view() {
        return m('.clearfix', [
            model().global.firebaseUser
                ? m(ProfileForm, {
                    email: model().global.firebaseUser.email,
                    photoURL: model().global.userData.photoURL
                })
                : m('p', 'not logged in')
            ,
        ]);
    }
};