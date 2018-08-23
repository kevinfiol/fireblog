import m from 'mithril';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { Button } from 'components/Button';

const { toggleSignUpForm, toggleSignInForm, signOut } = mutators.global;

export const Panel = {
    view() {
        return m('.clearfix', [
            model().global.user === null
                ? [
                    m(Button, { class: 'mx1', onclick: () => toggleSignUpForm(true) }, 'Sign Up'),
                    m(Button, { class: 'mx1', onclick: () => toggleSignInForm(true) }, 'Sign In'),
                ]
                : null
            ,

            model().global.user !== null
                ? m(Button, { onclick: () => signOut() }, 'Sign Out')
                : null
            ,
        ]);
    }
};