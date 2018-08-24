import m from 'mithril';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { Modal } from 'components/Modal';
import { Panel } from 'components/Layout/Panel';
import { SignUpForm } from 'components/Layout/SignUpForm';
import { SignInForm } from 'components/Layout/SignInForm';
import { Spinner } from 'components/Layout/Spinner';

const {
    toggleSignUpForm,
    toggleSignInForm,
    updateSignUpMsg,
    updateSignInMsg
} = mutators.global;

export const Layout = {
    view({children}) {
        return m('.clearfix', [
            m(Panel),
            m('.my3', children),

            model().global.isLoading
                ? m(Spinner)
                : null
            ,

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

            m('code', { style: { zIndex: '9999', position: 'absolute', bottom: '0', left: '0' } }, JSON.stringify( model() )),
        ]);
    }
};