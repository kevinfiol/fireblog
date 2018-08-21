import m from 'mithril';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { Button } from 'components/Button';
import { Modal } from 'components/Modal';
import { SignUpForm } from 'components/Layout/SignUpForm';
import { SignInForm } from 'components/Layout/SignInForm';
import { Spinner } from 'components/Layout/Spinner';

const { 
    toggleSignUpForm,
    toggleSignInForm,
    updateSignUpMsg,
    updateSignInMsg,
    signOut
} = mutators.global;

export const Layout = {
    view({children}) {
        return m('.clearfix', [
            model().global.isLoading
                ? m(Spinner)
                : null
            ,

            model().global.user === null
                ? [
                    m(Button, { onclick: () => toggleSignUpForm(true) }, 'Sign Up'),
                    m(Button, { onclick: () => toggleSignInForm(true) }, 'Sign In'),
                ]
                : null
            ,

            model().global.user !== null
                ? m(Button, { onclick: () => signOut() }, 'Sign Out')
                : null
            ,

            model().global.showSignUp
                ? m(Modal, { showModal: toggleSignUpForm, cancelMethod: () => updateSignUpMsg(null) }, m(SignUpForm))
                : null
            ,

            model().global.showSignIn
                ? m(Modal, { showModal: toggleSignInForm, cancelMethod: () => updateSignInMsg(null) }, m(SignInForm))
                : null
            ,

            children

            , m('code', { style: { zIndex: '9999', position: 'absolute', bottom: '0', left: '0' } }, JSON.stringify( model() )),
        ]);
    }
};