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
    const username = stream('');
    const pwd      = stream('');

    // Check if fields are filled
    const isFormValid = stream.combine((username, pwd) => {
        return username() && pwd();
    }, [username, pwd]);

    /**
     * Actions
     */
    let enableSignInForm;
    let setSignInMsg;
    let signInUser;

    return {
        /**
         * Oninit
         * @param {Object} attrs View Attributes 
         */
        oninit: ({attrs}) => {
            enableSignInForm = attrs.enableSignInForm;
            setSignInMsg     = attrs.setSignInMsg;
            signInUser       = attrs.signInUser;
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
            return [
                m('h3', 'Sign In'),

                m(InputText, {
                    placeholder: 'username',
                    input: username
                }),

                m(InputText, {
                    placeholder: 'password',
                    type: 'password',
                    input: pwd
                }),

                // Buttons
                m('.clearfix', [
                    m('.col.col-12', [
                        isFormValid()
                            ? m(LoadingBtn, { 
                                className: 'my1 btn-outline left',
                                onclick: () => signInUser( username(), pwd() ) 
                            }, 'Submit')
                            : null
                        ,

                        m(LoadingBtn, {
                            className: 'my1 btn-outline right',
                            onclick: () => {
                                setSignInMsg(null);
                                enableSignInForm(false);
                            }
                        }, 'Cancel'),
                    ])
                ]),

                signInMsg
                    ? m('p.p2.rounded.bg-darken', signInMsg)
                    : null
                ,
            ];
        }
    };
};