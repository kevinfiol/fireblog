import m from 'mithril';
import { Btn } from 'components/Btn';

/**
 * Panel Component
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
                    m(Btn, { className: 'mx1', onclick: () => showSignUpForm(true) }, 'Sign Up'),
                    m(Btn, { className: 'mx1', onclick: () => showSignInForm(true) }, 'Sign In'),
                ]
                : null
            ,
    
            isFirebaseUser
                ? [
                    m(Btn, {
                        className: 'mx1',
                        onclick: () => m.route.set('/')
                    }, 'Dashboard'),
    
                    m(Btn, {
                        className: 'mx1',
                        onclick: () => m.route.set('/u/:key', { key: username })
                    }, 'Profile'),
    
                    m(Btn, {
                        className: 'mx1',
                        onclick: () => m.route.set('/settings')
                    }, 'Settings'),
    
                    m(Btn, {
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