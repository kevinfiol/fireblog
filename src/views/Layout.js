import m from 'mithril';
import stream from 'mithril/stream';
import { model, mutators } from 'state';
import { Modal } from 'components/Modal';
import { SignUpForm } from 'components/SignUpForm';

const methods = { toggleSignUpForm: mutators.global.toggleSignUpForm };

export const Layout = {
    view({children}) {
        return m('.clearfix', [
            // m('a.mx3', { href: '/' }, 'dash'),
            // m('a.mx3', { href: '/profiles' }, 'profiles'),
            m('button.btn.btn-outline', { onclick: () => methods.toggleSignUpForm(true) }, 'Sign Up'),

            model().global.showSignUp
                ? m(Modal, { showModal: methods.toggleSignUpForm }, m(SignUpForm))
                : null
            ,

            children

            , m('code', { style: { zIndex: '9999', position: 'absolute', bottom: '0', left: '0' } }, JSON.stringify( model() )),
        ]);        
    }
};