const m = require('mithril');
require('core-js/modules/es7.promise.finally');

/**
 * Global Mutators
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 */

module.exports = (update, Firebase) => {
    const enqueue = () => update(model => {
        const id = Math.random();
        const queue = [...model.global.queue];
        queue.push(id);

        model.global.queue = queue;
        return model;
    });

    const dequeue = () => update(model => {
        const queue = [...model.global.queue];
        queue.shift();

        model.global.queue = queue;
        return model;
    });

    /**
     * UI Methods
     */
    // const toggleLoading = isLoading => update({
    //     global: { isLoading }
    // });

    const toggleSignUpForm = showSignUp => update(model => {
        model.global.showSignUp = showSignUp;
        return model;
    });

    const toggleSignInForm = showSignIn => update(model => {
        model.global.showSignIn = showSignIn;
        return model;
    });

    const updateSignUpMsg = signUpMsg => update(model => {
        model.global.signUpMsg = signUpMsg;
        return model;
    });

    const updateSignInMsg = signInMsg => update(model => {
        model.global.signInMsg = signInMsg;
        return model;
    });

    /**
     * User Account Methods
     */

    const setUserData = data => update(model => {
        if (!data) {
            model.global.userData = null;
            return model;
        }

        for (let key in data) {
            model.global.userData[key] = data[key];
        }

        return model;
    });

    const setFirebaseUser = user => update(model => {
        if (!user) {
            model.global.firebaseUser = null;
            return model;
        }

        model.global.firebaseUser = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            uid: user.uid
        };

        return model;
    });

    const createUser = (username, email, pwd) => {
        enqueue();
        // toggleLoading(true);

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
                dequeue();
                // toggleLoading(false);
                m.redraw();
            })
        ;
    };

    const signInUser = (email, pwd) => {
        enqueue();
        // toggleLoading(true);

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
                dequeue();
                // toggleLoading(false);
                m.redraw();
            })
        ;
    };

    const updateProfile = (prop, val) => {
        enqueue();
        // toggleLoading(true);

        return Firebase.updateProfile(prop, val)
            .then(() => {
                update({
                    global: {
                        firebaseUser: { [prop]: val }
                    }
                });
            })
            .finally(() => {
                dequeue();
                // toggleLoading(false);
                m.redraw();
            })
        ;
    };

    const updateUserData = (email, prop, val) => {
        enqueue();
        // toggleLoading(true);

        return Firebase.updateUserData(email, prop, val)
            .then(() => {
                setUserData({ [prop]: val })
            })
            .finally(() => {
                dequeue();
                // toggleLoading(false);
                m.redraw();
            })
        ;
    };

    const signOut = () => {
        enqueue();
        // toggleLoading(true);

        return Firebase.signOut().finally(() => {
            setUserData(null);
            // toggleLoading(false);
            dequeue();
            m.redraw();
        });
    };

    return {
        enqueue,
        dequeue,

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