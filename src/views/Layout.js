import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { Modal } from 'components/Modal';
import { Panel } from 'components/Layout/Panel';
import { SignUpForm } from 'components/Layout/SignUpForm';
import { SignInForm } from 'components/Layout/SignInForm';
import { Spinner } from 'components/Layout/Spinner';

const { showSignInForm, showSignUpForm, setSignUpMsg, setSignInMsg, signOut } = actions.global;

export const Layout = {
    view: ({children}) => m('.clearfix', [
        m('.fixed.top-0.left-0', [
            m(Panel, {
                // State
                firebaseUser: model().global.firebaseUser,
                username: model().global.userData.username,

                // Actions
                showSignInForm,
                showSignUpForm,
                signOut
            })
        ]),

        m('.my3', children),

        model().isLoading
            ? m(Spinner)
            : null
        ,

        model().global.showSignUp
            ? m(Modal, {
                showModal: showSignUpForm,
                cancelMethod: () => setSignUpMsg(null)
            }, m(SignUpForm))
            : null
        ,

        model().global.showSignIn
            ? m(Modal, {
                showModal: showSignInForm,
                cancelMethod: () => setSignInMsg(null)
            }, m(SignInForm))
            : null
        ,
    ])
};