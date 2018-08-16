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
    
    const assignUser = user => update({
        global: { user: user }
    });
    
    const updateSignUpMsg = message => update({
        global: { signUpMsg: message }
    });
    
    const createUser = (email, pwd) => {
        firebase.auth().createUserWithEmailAndPassword(email, pwd)
            .then(res => {
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

    return {
        toggleSignUpForm,
        assignUser,
        updateSignUpMsg,
        createUser
    };
};