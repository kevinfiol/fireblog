import m from 'mithril';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * Layout Panel Component
 */
export const Panel = {
    /**
     * View Method
     * @param {Object} attrs
     */
    view: ({attrs}) => {
        /**
         * State
         */
        const firebaseUser = attrs.firebaseUser;
        const username = attrs.username;

        /**
         * Actions
         */
        const showSignInForm = attrs.showSignInForm;
        const showSignUpForm = attrs.showSignUpForm;
        const signOut = attrs.signOut;

        /**
         * Computed
         */
        const isFirebaseUser = firebaseUser.uid !== null;

        /**
         * View
         */
        return m('.clearfix', [
            !isFirebaseUser
                ? [
                    m(LoadingBtn, { className: 'mx1', onclick: () => showSignUpForm(true) }, 'Sign Up'),
                    m(LoadingBtn, { className: 'mx1', onclick: () => showSignInForm(true) }, 'Sign In'),
                ]
                : null
            ,
    
            isFirebaseUser
                ? [
                    m(LoadingBtn, {
                        className: 'mx1',
                        onclick: () => m.route.set('/')
                    }, 'Dashboard'),
    
                    m(LoadingBtn, {
                        className: 'mx1',
                        onclick: () => m.route.set('/u/:key', { key: username })
                    }, 'Profile'),
    
                    m(LoadingBtn, {
                        className: 'mx1',
                        onclick: () => m.route.set('/settings')
                    }, 'Settings'),
    
                    m(LoadingBtn, {
                        className: 'mx1',
                        onclick: () => {
                            signOut();
                            m.route.set('/');
                        }
                    }, 'Sign Out')
                ]
                : null
            ,
        ]);
    }
};