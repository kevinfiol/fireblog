import m from 'mithril';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { Btn } from 'components/Btn';

const { toggleSignUpForm, toggleSignInForm, signOut } = mutators.global;

export const Panel = {
    view: () => m('.clearfix.p2', [
        model().global.firebaseUser === null
            ? [
                m(Btn, { className: 'mx1', onclick: () => toggleSignUpForm(true) }, 'Sign Up'),
                m(Btn, { className: 'mx1', onclick: () => toggleSignInForm(true) }, 'Sign In'),
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
                    onclick: () => m.route.set('/user/:key', { key: model().global.userData.username })
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