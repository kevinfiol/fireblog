import m from 'mithril';
import stream from 'mithril/stream';

export const SignInForm = () => {
    const email = stream('');
    const pwd = stream('');

    return () => {
        return m('div', [
            m('h3', 'Sign In'),

            m('label', 'email:'),
            m('input.input.bg-black.white.my1', {
                placeholder: 'joe@website.com',
                oninput: m.withAttr('value', email)
            }),

            m('label', 'password:'),
            m('input.input.bg-black.white.my1', {
                type: 'password',
                oninput: m.withAttr('value', pwd)
            })
        ]);
    };
};