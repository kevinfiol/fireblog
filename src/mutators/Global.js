import m from 'mithril';
import Firebase from 'services/Firebase';
import 'core-js/modules/es7.promise.finally';

export default (update) => ({
    assignUser(user) {
        return () => update({
            global: { user: user }
        });
    },

    createUser(email, pwd) {
        return () => {
            Firebase.createUser(email, pwd)
                .then(res => {
                    console.log('res', res);
                    this.updateSignUpMsg(null)();
                    this.assignUser(email)();
                })
                .catch(err => {
                    console.log('err', err);
                    this.updateSignUpMsg(err.message)();
                })
                .finally(m.redraw)
            ;
        };
    },

    updateSignUpMsg(message) {
        return () => update({
            global: { signUpMsg: message }
        });
    }
});