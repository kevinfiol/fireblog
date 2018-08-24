import m from 'mithril';
import stream from 'mithril/stream';
import { model } from 'state';
import { mutators } from 'mutators/index';
import { Button } from 'components/Button';

const { createUser } = mutators.global;

export const SignUpForm = () => {
    const email      = stream('');
    const pwd        = stream('');
    const confirmPwd = stream('');

    const pwdsMatch = stream.combine((pwd, confirmPwd) => {
        return pwd() === confirmPwd();
    }, [pwd, confirmPwd]);

    const isFormValid = stream.combine((email, pwdsMatch) => {
        const allFieldsFilled = email() && pwd() && confirmPwd();
        return allFieldsFilled && pwdsMatch();
    }, [email, pwdsMatch]);

    return {
        view() {
            return m('div', [
                m('h3', 'Sign Up'),
    
                m('label', 'email:'),
                m('input.input.bg-black.white.my1', {
                    placeholder: 'joe@website.com',
                    oninput: m.withAttr('value', email)
                }),
    
                m('label', 'password:'),
                m('input.input.bg-black.white.my1', {
                    type: 'password',
                    oninput: m.withAttr('value', pwd)
                }),
    
                m('label', 'confirm password:'),
                m('input.input.bg-black.white.my1', {
                    type: 'password',
                    oninput: m.withAttr('value', confirmPwd)
                }),

                isFormValid()
                    ? m(Button, {
                        className: 'my1',
                        onclick: () => createUser( email(), pwd() )
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