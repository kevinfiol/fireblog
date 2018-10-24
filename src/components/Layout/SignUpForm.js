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
    let enableSignUpForm;
    let setSignUpMsg;
    let createUser;

    return {
        oninit: ({attrs}) => {
            enableSignUpForm = attrs.enableSignUpForm;
            setSignUpMsg     = attrs.setSignUpMsg;
            createUser       = attrs.createUser;
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
            return [
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

                // Buttons
                m('.clearfix', [
                    m('.col.col-12', [
                        isFormValid()
                            ? m(LoadingBtn, {
                                className: 'my1 btn-outline left',
                                onclick: () => createUser( username(), email(), pwd() )
                            }, 'Submit')
                            : null
                        ,

                        m(LoadingBtn, {
                            className: 'my1 btn-outline right',
                            onclick: () => {
                                setSignUpMsg(null);
                                enableSignUpForm(false);
                            }
                        }, 'Cancel'),
                    ])
                ]),
    
                pwdsMatch()
                    ? null
                    : m('p.p2.rounded.bg-darken', 'Passwords must match.')
                ,

                signUpMsg
                    ? m('p.p2.rounded.bg-darken', signUpMsg)
                    : null
                ,
            ];
        }
    };
};