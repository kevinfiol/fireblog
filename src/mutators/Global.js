import m from 'mithril';
import Firebase from 'services/Firebase';
import 'core-js/modules/es7.promise.finally';

export default (update) => ({
    toggleSignUpForm(toShow) {
        update({
            global: { showSignUp: toShow }
        });
    },

    assignUser(user) {
        update({
            global: { user: user }
        });
    },

    updateSignUpMsg(message) {
        update({
            global: { signUpMsg: message }
        });
    },

    createUser(email, pwd) {
        Firebase.createUser(email, pwd)
            .then(res => {
                console.log('res', res);
                this.updateSignUpMsg(null);
                this.assignUser(email);
            })
            .catch(err => {
                console.log('err', err);
                this.updateSignUpMsg(err.message);
            })
            .finally(m.redraw)
        ;
    },
});