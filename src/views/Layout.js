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
    enableSignInForm,
    enableSignUpForm,
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
        const username     = model().global.userData.username;
        const signUpMsg    = model().global.signUpMsg;
        const signInMsg    = model().global.signInMsg;

        const isLoading  = model().isLoading;
        const showSignUp = model().global.showSignUp;
        const showSignIn = model().global.showSignIn;

        /**
         * View
         */
        return m('.clearfix', [
            m('.top-0.clearfix', { style: { height: '36px' } }, [
                m('.left', [
                    isLoading
                        ? m(Spinner)
                        : null
                    ,
                ]),

                m('.right', [
                    m(Panel, {
                        // State
                        firebaseUser,
                        username,
        
                        // Actions
                        enableSignInForm,
                        enableSignUpForm,
                        signOut
                    })
                ])
            ]),
    
            m('.col.col-12.my1', children),
    
            showSignUp
                ? m(Modal, [
                    m('.max-width-3.mx-auto', [
                        m(SignUpForm, {
                            // State
                            signUpMsg,
    
                            // Actions
                            enableSignUpForm,
                            setSignUpMsg,
                            createUser
                        })
                    ])
                ])
                : null
            ,

            showSignIn
                ? m(Modal, [
                    m('.max-width-3.mx-auto', [
                        m(SignInForm, {
                            // State
                            signInMsg,
                            
                            // Actions
                            enableSignInForm,
                            setSignInMsg,
                            signInUser
                        })
                    ])
                ])
                : null
            ,
        ]);
    }
};