const m = require('mithril');
require('core-js/modules/es7.promise.finally');

/**
 * Global Mutators
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 */

module.exports = (update, Firebase) => {
    const toggleSignUpForm = toShow => update({
        global: { showSignUp: toShow }
    });

    const toggleSignInForm = toShow => update({
        global: { showSignIn: toShow }
    });
    
    const assignUser = user => update({
        global: { user: user }
    });
    
    const updateSignUpMsg = message => update({
        global: { signUpMsg: message }
    });

    const updateSignInMsg = message => update({
        global: { signInMsg: message }
    });
    
    const createUser = (email, pwd) => {
        return Firebase.createUser(email, pwd)
            .then(() => {
                updateSignUpMsg(null);
                toggleSignUpForm(false);
            })
            .catch(err => {
                updateSignUpMsg(err.message);
            })
            .finally(m.redraw)
        ;
    };

    const signInUser = (email, pwd) => {
        return Firebase.signInUser(email, pwd)
            .then(() => {
                updateSignInMsg(null);
                toggleSignInForm(false);
            })
            .catch(err => {
                updateSignInMsg(err.message)
            })
            .finally(m.redraw)
        ;
    };

    return {
        toggleSignUpForm,
        toggleSignInForm,
        assignUser,
        updateSignUpMsg,
        updateSignInMsg,
        createUser,
        signInUser
    };
};