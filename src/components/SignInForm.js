import m from 'mithril';
import stream from 'mithril/stream';

export const SignInForm = {
    email: null,
    pwd: null,
    
    oninit({state}) {
        state.email = stream('');
        state.pwd = stream('');
    },

    view({state}) {
        return [
            m('h3', 'Sign In'),

            m('label', 'email:'),
            m('input.input.bg-black.white.my1', {
                placeholder: 'joe@website.com',
                oninput: m.withAttr('value', state.email)
            }),

            m('label', 'password:'),
            m('input.input.bg-black.white.my1', {
                type: 'password',
                oninput: m.withAttr('value', state.pwd)
            })
        ];
    }
};