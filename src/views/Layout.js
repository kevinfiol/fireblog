import m from 'mithril';
import stream from 'mithril/stream';
import { model } from 'state';
import { Modal } from 'components/Modal';
import { SignUpForm } from 'components/SignUpForm';

export const Layout = (v) => {
    const showSignUp = stream(false);
    
    return {
        view({children}) {
            return m('.clearfix', [
                // m('a.mx3', { href: '/' }, 'dash'),
                // m('a.mx3', { href: '/profiles' }, 'profiles'),
                m('button.btn.btn-outline', { onclick: () => showSignUp(true) }, 'Sign Up'),

                showSignUp()
                    ? m(Modal, { showModal: showSignUp }, m(SignUpForm))
                    : null
                ,
    
                children

                , m('code', JSON.stringify( model() )),
            ]);
        }
    };
};