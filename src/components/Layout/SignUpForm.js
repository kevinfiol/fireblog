import m from 'mithril';
import stream from 'mithril/stream';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { InputText } from 'components/InputText';
import { Btn } from 'components/Btn';

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
                    placeholder: 'username',
                    input: username
                }),

                m(InputText, {
                    placeholder: 'email',
                    input: email
                }),

                m(InputText, {
                    placeholder: 'password',
                    type: 'password',
                    input: pwd
                }),

                m(InputText, {
                    placeholder: 'confirm password',
                    type: 'password',
                    input: confirmPwd
                }),

                isFormValid()
                    ? m(Btn, {
                        className: 'my1 btn-outline',
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