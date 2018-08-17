import m from 'mithril';
import stream from 'mithril/stream';
import { model, mutators } from 'state';
import { Modal } from 'components/Modal';
import { SignUpForm } from 'components/SignUpForm';
import { SignInForm } from 'components/SignInForm';

const { 
    toggleSignUpForm,
    toggleSignInForm,
    updateSignUpMsg,
    updateSignInMsg
} = mutators.global;

export const Layout = {
    view({children}) {
        return m('.clearfix', [
            m('button.btn.btn-outline.mx1', { onclick: () => toggleSignUpForm(true) }, 'Sign Up'),
            m('button.btn.btn-outline.mx1', { onclick: () => toggleSignInForm(true) }, 'Sign In'),

            model().global.showSignUp
                ? m(Modal, {
                    showModal: toggleSignUpForm,
                    cancelMethod: () => updateSignUpMsg(null)
                }, m(SignUpForm))
                : null
            ,

            model().global.showSignIn
                ? m(Modal, {
                    showModal: toggleSignInForm,
                    cancelMethod: () => updateSignInMsg(null)
                }, m(SignInForm))
                : null
            ,

            children

            , m('code', { style: { zIndex: '9999', position: 'absolute', bottom: '0', left: '0' } }, JSON.stringify( model() )),
        ]);        
    }
};