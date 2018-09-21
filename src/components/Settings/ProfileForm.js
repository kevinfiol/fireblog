import m from 'mithril';
import stream from 'mithril/stream';
import { InputText } from 'components/InputText';
import { TextArea } from 'components/TextArea';
import { Btn } from 'components/Btn';


export const ProfileForm = () => {
    const photoURL = stream('');
    const bio      = stream('');

    return {
        view: ({attrs}) => m('.clearfix', [
            m(InputText, {
                placeholder: 'photo url',
                value: attrs.photoURL || '',
                input: photoURL
            }),

            m(Btn, {
                className: 'mt1 mb3 btn-outline',
                onclick: () => attrs.updateUserData(attrs.username, 'photoURL', photoURL())
            }, 'Update Photo'),

            m(TextArea, {
                placeholder: 'bio text',
                value: attrs.bio || '',
                input: bio
            }),

            m(Btn, {
                className: 'mt1 mb3 btn-outline',
                onclick: () => attrs.updateUserData(attrs.username, 'bio', bio())
            }, 'Update Bio')
        ])
    };
};