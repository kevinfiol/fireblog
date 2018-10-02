import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { Modal } from 'components/Modal';
import { Panel } from 'components/Layout/Panel';
import { SignUpForm } from 'components/Layout/SignUpForm';
import { SignInForm } from 'components/Layout/SignInForm';
import { Spinner } from 'components/Layout/Spinner';

/**
 * Actions
 */
const {
    signInUser,
    createUser,
    showSignInForm,
    showSignUpForm,
    setSignUpMsg,
    setSignInMsg,
    signOut
} = actions.global;

/**
 * Layout View
 * Renders Layout encapsulating child component
 */
export const Layout = {
    /**
     * View Method
     * @param {Array} children Child View 
     */
    view: ({children}) => {
        /**
         * State Variables
         */
        const firebaseUser = model().global.firebaseUser;
        const username = model().global.userData.username;
        const signUpMsg = model().global.signUpMsg;
        const signInMsg = model().global.signInMsg;

        const isLoading = model().isLoading;
        const showSignUp = model().global.showSignUp;
        const showSignIn = model().global.showSignIn;

        /**
         * View
         */
        return m('.clearfix', [
            m('.top-0.left-0', [
                m(Panel, {
                    // State
                    firebaseUser,
                    username,
    
                    // Actions
                    showSignInForm,
                    showSignUpForm,
                    signOut
                })
            ]),
    
            m('.my3', children),
    
            isLoading
                ? m(Spinner)
                : null
            ,
    
            showSignUp
                ? m(Modal, { showModal: showSignUpForm, cancelMethod: () => setSignUpMsg(null) }, [
                    m(SignUpForm, {
                        // State
                        signUpMsg,

                        // Actions
                        createUser
                    })
                ])
                : null
            ,
    
            showSignIn
                ? m(Modal, { showModal: showSignInForm, cancelMethod: () => setSignInMsg(null) }, [
                    m(SignInForm, {
                        // State
                        signInMsg,

                        // Actions
                        signInUser
                    })
                ])
                : null
            ,
        ]);
    }
};