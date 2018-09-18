import m from 'mithril';
import stream from 'mithril/stream';
import { model } from 'state';
import actions from 'actions';
import { InputText } from 'components/InputText';
import { Btn } from 'components/Btn';

const { signInUser } = actions.global;

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
                    placeholder: 'email',
                    input: email
                }),

                m(InputText, {
                    placeholder: 'password',
                    type: 'password',
                    input: pwd
                }),

                isFormValid()
                    ? m(Btn, { 
                        className: 'my1 btn-outline',
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