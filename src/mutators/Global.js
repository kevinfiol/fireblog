const m = require('mithril');
require('core-js/modules/es7.promise.finally');

/**
 * Global Mutators
 * @param {Stream} update 
 * @param {Object} Firebase 
 */

module.exports = (update, firebase) => {
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
        firebase.auth().createUserWithEmailAndPassword(email, pwd)
            .then(() => {
                updateSignUpMsg(null);
                assignUser(email);
                toggleSignUpForm(false);
            })
            .catch(err => {
                updateSignUpMsg(err.message);
            })
            .finally(m.redraw)
        ;
    };

    const signInUser = (email, pwd) => {
        firebase.auth().signInWithEmailAndPassword(email, pwd)
            .then((res) => {
                updateSignInMsg(null);
                assignUser(email);
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