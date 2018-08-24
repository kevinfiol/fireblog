import m from 'mithril';
import stream from 'mithril/stream';
import { Button } from 'components/Button';

const Input = {
    oninit: ({attrs}) => {
        if (attrs.input) attrs.input(attrs.value);
    },

    view: ({attrs}) => m('div', [
        m('label', attrs.label),
        m('input.input.input.bg-black.white.my1', {
            placeholder: attrs.label,
            oncreate: ({dom}) => dom.value = attrs.value,
            oninput: m.withAttr('value', attrs.input)
        })
    ])
};


export const ProfileForm = () => {
    const email       = stream('');
    const photoURL    = stream('');

    return {
        view: ({attrs}) => m('.clearfix', [
            m(Input, {
                label: 'Email',
                value: attrs.user.email,
                input: email
            }),

            m(Input, {
                label: 'Photo URL',
                value: attrs.user.photoURL,
                input: photoURL
            }),

            m(Button, { className: 'my2' }, 'Save Changes')
        ])
    };
};