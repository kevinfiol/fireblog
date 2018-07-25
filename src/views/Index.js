import m from 'mithril';
import { SignUpForm } from 'components/SignUpForm';
import { SignInForm } from 'components/SignInForm';

export const Index = {
    view() {
        return [
            m('p', 'index page'),
            m(SignUpForm),
            m(SignInForm)
        ];
    }
};