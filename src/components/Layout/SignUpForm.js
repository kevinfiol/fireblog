import m from 'mithril';
import stream from 'mithril/stream';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { InputText } from 'components/InputText';
import { Button } from 'components/Button';

const { createUser, getUserNames } = mutators.global;

export const SignUpForm = () => {
    const username   = stream('');
    const email      = stream('');
    const pwd        = stream('');
    const confirmPwd = stream('');

    const pwdsMatch = stream.combine((pwd, confirmPwd) => {
        return pwd() === confirmPwd();
    }, [pwd, confirmPwd]);

    const isFormValid = stream.combine((email, pwdsMatch) => {
        const allFieldsFilled = email() && pwd() && confirmPwd() && username();
        return allFieldsFilled && pwdsMatch();
    }, [email, pwdsMatch]);

    return {
        view() {
            return m('div', [
                m('h3', 'Sign Up'),

                m(InputText, {
                    label: 'display name:',
                    placeholder: 'Joe',
                    input: username
                }),

                m(InputText, {
                    label: 'email:',
                    placeholder: 'joe@website.com',
                    input: email
                }),

                m(InputText, {
                    label: 'password:',
                    type: 'password',
                    input: pwd
                }),

                m(InputText, {
                    label: 'confirm password:',
                    input: confirmPwd
                }),

                isFormValid()
                    ? m(Button, {
                        className: 'my1',
                        onclick: () => createUser( username(), email(), pwd() )
                    }, 'Submit')
                    : null
                ,
    
                pwdsMatch()
                    ? null
                    : m('p.p2.rounded.bg-lighten', 'Passwords must match.')
                ,

                model().global.signUpMsg
                    ? m('p.p2.rounded.bg-lighten', model().global.signUpMsg)
                    : null
                ,
            ]);
        }
    };
};