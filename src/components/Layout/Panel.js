import m from 'mithril';
import { Btn } from 'components/Btn';

export const Panel = {
    view: ({attrs}) => m('.clearfix.p2', [
        attrs.firebaseUser === null
            ? [
                m(Btn, { className: 'mx1', onclick: () => attrs.showSignUpForm(true) }, 'Sign Up'),
                m(Btn, { className: 'mx1', onclick: () => attrs.showSignInForm(true) }, 'Sign In'),
            ]
            : null
        ,

        attrs.firebaseUser !== null
            ? [
                m(Btn, {
                    className: 'mx1',
                    onclick: () => m.route.set('/')
                }, 'Dashboard'),

                m(Btn, {
                    className: 'mx1',
                    onclick: () => m.route.set('/u/:key', { key: attrs.username })
                }, 'Profile'),

                m(Btn, {
                    className: 'mx1',
                    onclick: () => m.route.set('/settings')
                }, 'Settings'),

                m(Btn, {
                    className: 'mx1',
                    onclick: () => {
                        attrs.signOut();
                        m.route.set('/');
                    }
                }, 'Sign Out')
            ]
            : null
        ,
    ])
};