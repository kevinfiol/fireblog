import m from 'mithril';
import stream from 'mithril/stream';
import { InputText } from 'components/InputText';
import { Btn } from 'components/Btn';

/**
 * SignUpForm Component
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

    return {
        /**
         * View Method
         * @param {Object} attrs
         */
        view({attrs}) {
            /**
             * State
             */
            const signUpMsg = attrs.signUpMsg;

            /**
             * Actions
             */
            const createUser = attrs.createUser;

            /**
             * View
             */
            return m('.clearfix', [
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
                    ? m(Btn, {
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