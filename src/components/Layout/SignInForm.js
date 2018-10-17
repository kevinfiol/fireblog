import m from 'mithril';
import stream from 'mithril/stream';
import { InputText } from 'components/InputText';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * Layout SignInForm Component
 */
export const SignInForm = () => {
    /**
     * Local State
     */
    const email = stream('');
    const pwd   = stream('');

    // Check if fields are filled
    const isFormValid = stream.combine((email, pwd) => {
        return email() && pwd();
    }, [email, pwd]);

    /**
     * Actions
     */
    let signInUser;

    return {
        /**
         * Oninit
         * @param {Object} attrs View Attributes 
         */
        oninit: ({attrs}) => {
            signInUser = attrs.signInUser;
        },

        /**
         * View Method
         * @param {Object} attrs View Attributes
         */
        view: ({attrs}) => {
            /**
             * State
             */
            const signInMsg = attrs.signInMsg;

            /**
             * View
             */
            return m('div', [
                m('h3', 'Sign In'),

                m(InputText, {
                    placeholder: 'email',
                    input: email
                }),

                m(InputText, {
                    placeholder: 'password',
                    type: 'password',
                    input: pwd
                }),

                isFormValid()
                    ? m(LoadingBtn, { 
                        className: 'my1 btn-outline',
                        onclick: () => signInUser( email(), pwd() ) 
                    }, 'Submit')
                    : null
                ,

                signInMsg
                    ? m('p.p2.rounded.bg-darken', signInMsg)
                    : null
                ,
            ]);
        }
    };
};