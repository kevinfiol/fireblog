import m from 'mithril';
import stream from 'mithril/stream';
import { mutators } from 'mutators/index';
import { InputText } from 'components/InputText';
import { Button } from 'components/Button';

const { updateUserData } = mutators.global;

export const ProfileForm = () => {
    const photoURL    = stream('');

    return {
        view: ({attrs}) => m('.clearfix', [
            m(InputText, {
                label: 'photo url',
                value: attrs.photoURL || '',
                input: photoURL
            }),

            m(Button, {
                className: 'my2',
                onclick: () => updateUserData(attrs.email, 'photoURL', photoURL())
            }, 'Update Photo')
        ])
    };
};