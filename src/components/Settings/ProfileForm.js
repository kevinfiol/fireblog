import m from 'mithril';
import stream from 'mithril/stream';
import { InputText } from 'components/InputText';
import { TextArea } from 'components/TextArea';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * Settings ProfileForm Component
 */
export const ProfileForm = () => {
    /**
     * Local State
     */
    const photoURLStream = stream('');
    const bioStream      = stream('');

    return {
        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const username = attrs.username;
            const photoURL = attrs.photoURL;
            const bio = attrs.bio;

            /**
             * Actions
             */
            const updateUserData = attrs.updateUserData;

            /**
             * View
             */
            return [
                m(InputText, {
                    placeholder: 'photo url',
                    value: photoURL || '',
                    input: photoURLStream
                }),

                m(LoadingBtn, {
                    className: 'mt1 mb3 btn-outline',
                    onclick: () => updateUserData(username, 'photoURL', photoURLStream())
                }, 'Update Photo'),

                m(TextArea, {
                    maxlength: '300',
                    placeholder: 'bio text',
                    value: bio || '',
                    input: bioStream
                }),

                m(LoadingBtn, {
                    className: 'mt1 mb3 btn-outline',
                    onclick: () => updateUserData(username, 'bio', bioStream())
                }, 'Update Bio')
            ];
        }
    };
};