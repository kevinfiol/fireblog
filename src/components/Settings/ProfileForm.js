import m from 'mithril';
import stream from 'mithril/stream';
import { InputText } from 'components/InputText';
import { Button } from 'components/Button';

export const ProfileForm = () => {
    const email       = stream('');
    const photoURL    = stream('');

    return {
        view: ({attrs}) => m('.clearfix', [
            m(InputText, {
                label: 'email',
                value: attrs.user.email,
                input: email
            }),

            m(InputText, {
                label: 'photo url',
                value: attrs.user.photoURL,
                input: photoURL
            }),

            m(Button, { className: 'my2' }, 'Save Changes')
        ])
    };
};