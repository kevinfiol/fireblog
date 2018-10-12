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
        const enableSignInForm = attrs.enableSignInForm;
        const enableSignUpForm = attrs.enableSignUpForm;
        const signOut = attrs.signOut;

        /**
         * Computed
         */
        const isFirebaseUser = firebaseUser.uid !== null;

        /**
         * View
         */
        return [
            !isFirebaseUser
                ? [
                    m(LoadingBtn, { className: 'a-btn p1 mx1', onclick: () => enableSignUpForm(true) }, 'Sign Up'),
                    m(LoadingBtn, { className: 'a-btn p1 mx1', onclick: () => enableSignInForm(true) }, 'Sign In'),
                ]
                : null
            ,
    
            isFirebaseUser
                ? [
                    m(LoadingBtn, {
                        className: 'a-btn px0 py1 mx1',
                        onclick: () => m.route.set('/')
                    }, 'Dashboard'),
    
                    m(LoadingBtn, {
                        className: 'a-btn px0 py1 mx1',
                        onclick: () => m.route.set('/u/:key', { key: username })
                    }, 'Profile'),
    
                    m(LoadingBtn, {
                        className: 'a-btn px0 py1 mx1',
                        onclick: () => m.route.set('/settings')
                    }, 'Settings'),
    
                    m(LoadingBtn, {
                        className: 'a-btn px0 py1 mx1',
                        onclick: () => {
                            signOut();
                            
                            if (m.route.get() === '/settings') {
                                m.route.set('/');
                            }
                        }
                    }, 'Sign Out')
                ]
                : null
            ,
        ];
    }
};