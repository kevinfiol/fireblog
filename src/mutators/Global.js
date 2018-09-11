const m = require('mithril');

/**
 * Global Mutators
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 */

module.exports = (update, Firebase) => {
    const toggleLoading = isLoading => update(model => {
        model.global.isLoading = isLoading;
        return model;
    });

    const enqueue = () => update(model => {
        const queue = [...model.global.queue];
        queue.push(0);

        toggleLoading(queue.length > 0);
        setTimeout(m.redraw);

        model.global.queue = queue;
        return model;
    });

    const dequeue = () => update(model => {
        const queue = [...model.global.queue];
        queue.shift();

        toggleLoading(queue.length > 0);
        setTimeout(m.redraw);

        model.global.queue = queue;
        return model;
    });

    /**
     * UI Methods
     */
    const toggleSignUpForm = showSignUp => update(model => {
        model.global.showSignUp = showSignUp;
        return model;
    });

    const toggleSignInForm = showSignIn => update(model => {
        model.global.showSignIn = showSignIn;
        return model;
    });

    const setSignUpMsg = signUpMsg => update(model => {
        model.global.signUpMsg = signUpMsg;
        return model;
    });

    const setSignInMsg = signInMsg => update(model => {
        model.global.signInMsg = signInMsg;
        return model;
    });

    /**
     * User Account Methods
     */

    const setUserData = data => update(model => {
        if (!data) {
            model.global.userData = {
                username: null,
                uid: null,
                photoURL: null,
                bio: null
            };

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
                setSignUpMsg(null);
                toggleSignUpForm(false);
            })
            .catch(err => {
                setSignUpMsg(err.message);
            })
            .finally(() => {
                dequeue();
            })
        ;
    };

    const signInUser = (email, pwd) => {
        enqueue();

        return Firebase.signInUser(email, pwd)
            .then(() => Firebase.getUserDataByEmail(email))
            .then(setUserData)
            .then(() => {
                setSignInMsg(null);
                toggleSignInForm(false);
            })
            .catch(err => {
                setSignInMsg(err.message);
            })
            .finally(() => {
                dequeue();
            })
        ;
    };

    const updateUserData = (email, prop, val) => {
        enqueue();

        return Firebase.updateUserData(email, prop, val)
            .then(() => {
                setUserData({ [prop]: val });
            })
            .finally(() => {
                dequeue();
            })
        ;
    };

    const signOut = () => {
        enqueue();

        return Firebase.signOut().finally(() => {
            setUserData(null);
            dequeue();
        });
    };

    return {
        enqueue,
        dequeue,
        toggleSignUpForm,
        toggleSignInForm,
        setFirebaseUser,
        setSignUpMsg,
        setSignInMsg,
        createUser,
        signInUser,
        signOut,
        setUserData,
        updateUserData
    };
};