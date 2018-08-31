import m from 'mithril';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { Button } from 'components/Button';

const { toggleSignUpForm, toggleSignInForm, signOut } = mutators.global;

export const Panel = {
    view() {
        return m('.clearfix', [
            model().global.firebaseUser === null
                ? [
                    m(Button, { className: 'mx1', onclick: () => toggleSignUpForm(true) }, 'Sign Up'),
                    m(Button, { className: 'mx1', onclick: () => toggleSignInForm(true) }, 'Sign In'),
                ]
                : null
            ,

            model().global.firebaseUser !== null
                ? [
                    m(Button, { className: 'mx1', onclick: () => m.route.set('/') }, 'Dashboard'),
                    m(Button, { className: 'mx1', onclick: () => m.route.set('/settings') }, 'Settings'),
                    m(Button, {
                        className: 'mx1',
                        onclick: () => {
                            signOut();
                            m.route.set('/');
                        }
                    }, 'Sign Out')
                ]
                : null
            ,
        ]);
    }
};