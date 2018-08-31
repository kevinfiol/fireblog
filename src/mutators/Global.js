const m = require('mithril');
require('core-js/modules/es7.promise.finally');

/**
 * Global Mutators
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 */

module.exports = (update, Firebase) => {
    /**
     * UI Methods
     */
    const toggleLoading = isLoading => update({
        global: { isLoading }
    });

    const toggleSignUpForm = showSignUp => update({
        global: { showSignUp }
    });

    const toggleSignInForm = showSignIn => update({
        global: { showSignIn }
    });

    const updateSignUpMsg = signUpMsg => update({
        global: { signUpMsg }
    });

    const updateSignInMsg = signInMsg => update({
        global: { signInMsg }
    });

    /**
     * User Account Methods
     */

    const setUserData = data => {
        for (let key in data) {
            update({
                global: {
                    userData: { [key]: data[key] }
                }
            });
        }
    };

    const setFirebaseUser = user => {
        if (!user) {
            update({ global: { firebaseUser: null } });
            return;
        }

        update({
            global: {
                firebaseUser: {
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                    uid: user.uid
                }
            }
        });
    };

    const createUser = (username, email, pwd) => {
        toggleLoading(true);

        // Check if userName exists first
        return Firebase.getUserNames()
            .then(users => users.includes(username))
            .then(userExists => {
                // Throw Error if user exists
                if (userExists) throw { message: 'Username taken.' };
                // Else create user w/ email
                else return Firebase.createUser(email, pwd);
            })
            .then(({ user }) => {
                // Add username & uid to DB & state
                setUserData({ username, uid: user.uid });
                return Firebase.addUserToDatabase(email, username, user.uid);
            })
            .then(() => {
                updateSignUpMsg(null);
                toggleSignUpForm(false);
            })
            .catch(err => {
                updateSignUpMsg(err.message);
            })
            .finally(() => {
                toggleLoading(false);
                m.redraw();
            })
        ;
    };

    const signInUser = (email, pwd) => {
        toggleLoading(true);

        return Firebase.signInUser(email, pwd)
            .then(() => Firebase.getUserDataByEmail(email))
            .then(setUserData)
            .then(() => {
                updateSignInMsg(null);
                toggleSignInForm(false);
            })
            .catch(err => {
                updateSignInMsg(err.message)
            })
            .finally(() => {
                toggleLoading(false);
                m.redraw();
            })
        ;
    };

    const updateProfile = (prop, val) => {
        toggleLoading(true);

        return Firebase.updateProfile(prop, val)
            .then(() => {
                update({
                    global: {
                        firebaseUser: { [prop]: val }
                    }
                });
            })
            .finally(() => {
                toggleLoading(false);
                m.redraw();
            })
        ;
    };

    const updateUserData = (email, prop, val) => {
        toggleLoading(true);

        return Firebase.updateUserData(email, prop, val)
            .then(() => {
                setUserData({ prop: val })
            })
            .finally(() => {
                toggleLoading(false);
                m.redraw();
            })
        ;
    };

    const signOut = () => {
        toggleLoading(true);

        return Firebase.signOut().finally(() => {
            setUserData(null);
            toggleLoading(false);
            m.redraw();
        });
    };

    return {
        toggleLoading,
        toggleSignUpForm,
        toggleSignInForm,
        setFirebaseUser,
        updateProfile,
        updateSignUpMsg,
        updateSignInMsg,
        createUser,
        signInUser,
        signOut,
        setUserData,
        updateUserData
    };
};