import m from 'mithril';
import stream from 'mithril/stream';

export const SignUpForm = () => {
    const email = stream('');
    const pwd = stream('');
    const confirmPwd = stream('');
    const emailRegex = new RegExp('\\S+@\\S+');

    const isFormValid = stream.combine((email, pwd, confirmPwd) => {
        const allFieldsFilled = email() && pwd() && confirmPwd();
        const pwdsMatch = pwd() === confirmPwd();
        const emailValid = emailRegex.test(email());

        return allFieldsFilled && pwdsMatch && emailValid;
    }, [email, pwd, confirmPwd]);

    const message = stream.combine((email, pwd, confirmPwd) => {
        if (!email() && !pwd() && !confirmPwd())
            return null;
        if (!email() || !emailRegex.test(email()))
            return 'Please enter valid email address.';
        if (!pwd())
            return 'Please enter a password.';
        if (!confirmPwd())
            return 'Please confirm your password.';
        if (confirmPwd() !== pwd())
            return 'Passwords must match.';

        return null;
    }, [email, pwd, confirmPwd]);

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
    
                m('button.btn.btn-outline.my1', {
                    onclick: () => signUpAction(email(), pwd()),
                    disabled: !isFormValid()
                }, 'Submit'),
    
                message()
                    ? m('p.p2.rounded.bg-lighten', message())
                    : null
                ,
            ]);
        }
    };
};

function signUpAction(email, pwd) {
    console.log('email', email);
    console.log('pwd', pwd);
}