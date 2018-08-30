import m from 'mithril';
import stream from 'mithril/stream';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { InputText } from 'components/InputText';
import { Button } from 'components/Button';

const { signInUser } = mutators.global;

export const SignInForm = () => {
    const email = stream('');
    const pwd   = stream('');

    // Check if fields are filled
    const isFormValid = stream.combine((email, pwd) => {
        return email() && pwd();
    }, [email, pwd]);

    return {
        view() {
            return m('div', [
                m('h3', 'Sign In'),

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

                isFormValid()
                    ? m(Button, { 
                        className: 'my1',
                        onclick: () => signInUser( email(), pwd() ) 
                    }, 'Submit')
                    : null
                ,

                model().global.signInMsg
                    ? m('p.p2.rounded.bg-lighten', model().global.signInMsg)
                    : null
                ,
            ]);
        }
    };
};