import m from 'mithril';
import { model } from 'state';
import actions from 'actions';
import { Btn } from 'components/Btn';

const { showSignUpForm, showSignInForm, signOut } = actions.global;

export const Panel = {
    view: () => m('.clearfix.p2', [
        model().global.firebaseUser === null
            ? [
                m(Btn, { className: 'mx1', onclick: () => showSignUpForm(true) }, 'Sign Up'),
                m(Btn, { className: 'mx1', onclick: () => showSignInForm(true) }, 'Sign In'),
            ]
            : null
        ,

        model().global.firebaseUser !== null
            ? [
                m(Btn, {
                    className: 'mx1',
                    onclick: () => m.route.set('/')
                }, 'Dashboard'),

                m(Btn, {
                    className: 'mx1',
                    onclick: () => m.route.set('/u/:key', { key: model().global.userData.username })
                }, 'Profile'),

                m(Btn, {
                    className: 'mx1',
                    onclick: () => m.route.set('/settings')
                }, 'Settings'),

                m(Btn, {
                    className: 'mx1',
                    onclick: () => {
                        signOut();
                        m.route.set('/');
                    }
                }, 'Sign Out')
            ]
            : null
        ,
    ])
};