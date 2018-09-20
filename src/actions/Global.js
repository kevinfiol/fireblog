/**
 * Global Action Types
 */

const GLOBAL_SHOW_SIGNUP      = 'GLOBAL_SHOW_SIGNUP';
const GLOBAL_SHOW_SIGNIN      = 'GLOBAL_SHOW_SIGNIN';

const GLOBAL_SET_SIGNUPMSG    = 'GLOBAL_SET_SIGNUPMSG';
const GLOBAL_SET_SIGNINMSG    = 'GLOBAL_SET_SIGNINMSG';
const GLOBAL_SET_USERDATA     = 'GLOBAL_SET_USERDATA';
const GLOBAL_SET_FIREBASEUSER = 'GLOBAL_SET_FIREBASEUSER';

const GLOBAL_CREATE_USER      = 'GLOBAL_CREATE_USER';
const GLOBAL_SIGNIN_USER      = 'GLOBAL_SIGNIN_USER';
const GLOBAL_UPDATE_USERDATA  = 'GLOBAL_UPDATE_USERDATA';
const GLOBAL_SIGNOUT          = 'GLOBAL_SIGNOUT';

/**
 * Global Actions
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 * @param {Object} queue    Queue Actions
 */

module.exports = (update, Firebase, queue) => {
    /**
     * UI Actions
     */
    const showSignUpForm = showSignUp => update(() => ({
        type: GLOBAL_SHOW_SIGNUP,
        model: { global: { showSignUp } }
    }));

    const showSignInForm = showSignIn => update(() => ({
        type: GLOBAL_SHOW_SIGNIN,
        model: { global: { showSignIn } }
    }));

    const setSignUpMsg = signUpMsg => update(() => ({
        type: GLOBAL_SET_SIGNUPMSG,
        model: { global: { signUpMsg } }
    }));

    const setSignInMsg = signInMsg => update(() => ({
        type: GLOBAL_SET_SIGNINMSG,
        model: { global: { signInMsg } }
    }));

    /**
     * User Account Methods
     */
    const setUserData = data => update(() => {
        const type = GLOBAL_SET_USERDATA;
        let userData = {};

        if (!data) {
            userData = {
                username: null,
                uid: null,
                photoURL: null,
                bio: null
            };
        } else {
            for (let key in data) {
                userData[key] = data[key];
            }
        }

        return {
            type,
            model: { global: { userData } }
        };
    });

    const setFirebaseUser = user => update(() => {
        const type = GLOBAL_SET_FIREBASEUSER;
        let firebaseUser = null;

        if (user) {
            firebaseUser = {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                uid: user.uid
            };
        }

        return {
            type,
            model: { global: { firebaseUser } }
        };
    });

    /**
     * Async Actions
     */
    const createUser = (username, email, pwd) => {
        const action = { type: GLOBAL_CREATE_USER };

        // Queue Async Action
        queue.enqueue(action);

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
                showSignUpForm(false);
            })
            .catch(err => {
                setSignUpMsg(err.message);
            })
            .finally(() => {
                queue.dequeue(action);
            })
        ;
    };

    const signInUser = (email, pwd) => {
        const action = { type: GLOBAL_SIGNIN_USER };

        // Queue Async Action
        queue.enqueue(action);

        return Firebase.signInUser(email, pwd)
            .then(() => Firebase.getUserDataByEmail(email))
            .then(setUserData)
            .then(() => {
                setSignInMsg(null);
                showSignInForm(false);
            })
            .catch(err => {
                setSignInMsg(err.message);
            })
            .finally(() => {
                queue.dequeue(action);
            })
        ;
    };

    const updateUserData = (email, prop, val) => {
        const action = { type: GLOBAL_UPDATE_USERDATA };

        // Queue Async Action
        queue.enqueue(action);

        return Firebase.updateUserData(email, prop, val)
            .then(() => {
                setUserData({ [prop]: val });
            })
            .finally(() => {
                queue.dequeue(action);
            })
        ;
    };

    const signOut = () => {
        const action = { type: GLOBAL_SIGNOUT };

        // Queue Async Action
        queue.enqueue(action);

        return Firebase.signOut().finally(() => {
            setUserData(null);
            queue.dequeue(action);
        });
    };

    return {
        showSignUpForm,
        showSignInForm,
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