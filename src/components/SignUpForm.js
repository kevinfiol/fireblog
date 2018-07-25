import m from 'mithril';
import stream from 'mithril/stream';

export const SignUpForm = {
    email: null,
    pwd: null,
    confirmPwd: null,

    isFormValid: null,
    message: null,
    
    oninit({state}) {
        state.email = stream('');
        state.pwd = stream('');
        state.confirmPwd = stream('');

        state.isFormValid = stream.combine((email, pwd, confirmPwd) => {
            return  (email() && pwd() && confirmPwd())
                && (pwd() === confirmPwd())
            ;
        }, [state.email, state.pwd, state.confirmPwd]);

        state.message = stream.combine((email, pwd, confirmPwd) => {
            if (!email() && !pwd() && !confirmPwd())
                return null;
            if (!email())
                return 'Please enter valid email address.';
            if (!pwd())
                return 'Please enter password';
            if (!confirmPwd())
                return 'Please confirm password';
            if (confirmPwd() !== pwd())
                return 'Passwords must match.';

            return null;
        }, [state.email, state.pwd, state.confirmPwd]);
    },

    view({state}) {
        return [
            m('h3', 'Sign Up'),

            m('label', 'email:'),
            m('input.input.bg-black.white.my1', {
                placeholder: 'joe@website.com',
                oninput: m.withAttr('value', state.email)
            }),

            m('label', 'password:'),
            m('input.input.bg-black.white.my1', {
                type: 'password',
                oninput: m.withAttr('value', state.pwd)
            }),

            m('label', 'confirm password:'),
            m('input.input.bg-black.white.my1', {
                type: 'password',
                oninput: m.withAttr('value', state.confirmPwd)
            }),

            state.message()
                ? m('p.p2.rounded.bg-lighten', state.message())
                : null
            ,

            m('button.btn.btn-outline.my1', {
                onclick: () => signUpAction(state.email(), state.pwd()),
                disabled: !state.isFormValid()
            }, 'Submit')
        ];
    }
};

function signUpAction(email, pwd) {
    console.log('email', email);
    console.log('pwd', pwd);
}