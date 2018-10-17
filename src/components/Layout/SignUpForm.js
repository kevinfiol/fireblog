import m from 'mithril';
import stream from 'mithril/stream';
import { InputText } from 'components/InputText';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * Layout SignUpForm Component
 */
export const SignUpForm = () => {
    /**
     * Local State
     */
    const username   = stream('');
    const email      = stream('');
    const pwd        = stream('');
    const confirmPwd = stream('');

    const pwdsMatch = stream.combine((pwd, confirmPwd) => {
        return pwd() === confirmPwd();
    }, [pwd, confirmPwd]);

    const isFormValid = stream.combine((email, pwdsMatch) => {
        const allFieldsFilled = email() && pwd() && confirmPwd() && username();
        return allFieldsFilled && pwdsMatch();
    }, [email, pwdsMatch]);

    /**
     * Actions
     */
    let createUser;

    return {
        oninit: ({attrs}) => {
            createUser = attrs.createUser;
        },

        /**
         * View Method
         * @param {Object} attrs
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const signUpMsg = attrs.signUpMsg;

            /**
             * View
             */
            return m('div', [
                m('h3', 'Sign Up'),

                m(InputText, {
                    placeholder: 'username',
                    input: username
                }),

                m(InputText, {
                    placeholder: 'email',
                    input: email
                }),

                m(InputText, {
                    placeholder: 'password',
                    type: 'password',
                    input: pwd
                }),

                m(InputText, {
                    placeholder: 'confirm password',
                    type: 'password',
                    input: confirmPwd
                }),

                isFormValid()
                    ? m(LoadingBtn, {
                        className: 'my1 btn-outline',
                        onclick: () => createUser( username(), email(), pwd() )
                    }, 'Submit')
                    : null
                ,
    
                pwdsMatch()
                    ? null
                    : m('p.p2.rounded.bg-darken', 'Passwords must match.')
                ,

                signUpMsg
                    ? m('p.p2.rounded.bg-darken', signUpMsg)
                    : null
                ,
            ]);
        }
    };
};