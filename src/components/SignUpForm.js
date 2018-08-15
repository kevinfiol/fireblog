import m from 'mithril';
import stream from 'mithril/stream';
import { model, mutators } from 'state';

const methods = { createUser: mutators.global.createUser };

export const SignUpForm = () => {
    const email = stream('');
    const pwd = stream('');
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
                    ? m('button.btn.btn-outline.my1', {
                        onclick: () => methods.createUser( email(), pwd() ),
                        disabled: !isFormValid()
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