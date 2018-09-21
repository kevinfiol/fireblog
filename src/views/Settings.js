import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { ProfileForm } from 'components/Settings/ProfileForm';

const { updateUserData } = actions.global;

export const Settings = {
    oninit() {
        // If not signed in, redirect to dash
        if (!model().global.firebaseUser) m.route.set('/');
    },

    view() {
        return m('.clearfix', [
            model().global.firebaseUser
                ? m(ProfileForm, {
                    // State
                    username: model().global.userData.username,
                    photoURL: model().global.userData.photoURL,
                    bio: model().global.userData.bio,

                    // Actions
                    updateUserData
                })
                : m('p', 'not logged in')
            ,
        ]);
    }
};