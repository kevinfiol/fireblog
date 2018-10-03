import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { ProfileForm } from 'components/Settings/ProfileForm';

/**
 * Actions
 */
const { updateUserData } = actions.global;

/**
 * Settings View
 */
export const Settings = {
    /**
     * Oninit Method
     */
    oninit() {
        const firebaseUser = model().global.firebaseUser;

        // If not signed in, redirect to dash
        if (!firebaseUser.uid) m.route.set('/');
    },

    /**
     * View Method
     */
    view() {
        /**
         * State
         */
        const firebaseUser = model().global.firebaseUser;
        const username = model().global.userData.username;
        const photoURL = model().global.userData.photoURL;
        const bio = model().global.userData.bio;

        /**
         * Computed
         */
        const isFirebaseUserLoaded = firebaseUser.uid !== null;

        /**
         * View
         */
        return m('.clearfix', [
            isFirebaseUserLoaded
                ? m(ProfileForm, {
                    // State
                    username,
                    photoURL,
                    bio,

                    // Actions
                    updateUserData
                })
                : m('p', 'Not logged in.')
            ,
        ]);
    }
};