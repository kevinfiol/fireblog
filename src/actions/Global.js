/**
 * Global Action Types
 */
const GLOBAL_ENABLE_POSTEDITOR  = 'GLOBAL_ENABLE_POSTEDITOR';
const GLOBAL_ENABLE_SIGNUP      = 'GLOBAL_ENABLE_SIGNUP';
const GLOBAL_ENABLE_SIGNIN      = 'GLOBAL_ENABLE_SIGNIN';

const GLOBAL_SET_SIGNUPMSG      = 'GLOBAL_SET_SIGNUPMSG';
const GLOBAL_SET_SIGNINMSG      = 'GLOBAL_SET_SIGNINMSG';
const GLOBAL_SET_USERDATA       = 'GLOBAL_SET_USERDATA';
const GLOBAL_SET_FIREBASEUSER   = 'GLOBAL_SET_FIREBASEUSER';

const GLOBAL_CREATE_USER        = 'GLOBAL_CREATE_USER';
const GLOBAL_SIGNIN_USER        = 'GLOBAL_SIGNIN_USER';
const GLOBAL_UPDATE_USERDATA    = 'GLOBAL_UPDATE_USERDATA';
const GLOBAL_SIGNOUT            = 'GLOBAL_SIGNOUT';

/**
 * Global Actions
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 * @param {Object} queue    Queue Actions
 */
module.exports = (update, queue, initial, Firebase) => {
    /**
     * UI Actions
     */
    const enableEditor = showEditor => update(() => ({
        type: GLOBAL_ENABLE_POSTEDITOR,
        model: { global: { showEditor } }
    }));

    const enableSignUpForm = showSignUp => update(() => ({
        type: GLOBAL_ENABLE_SIGNUP,
        model: { global: { showSignUp } }
    }));

    const enableSignInForm = showSignIn => update(() => ({
        type: GLOBAL_ENABLE_SIGNIN,
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
    const setUserData = userData => update(() => ({
        type: GLOBAL_SET_USERDATA,
        model: { global: { userData: userData || initial.userData } }
    }));

    const setFirebaseUser = user => update(() => {
        const type = GLOBAL_SET_FIREBASEUSER;
        let firebaseUser;

        if (!user) firebaseUser = initial.firebaseUser;
        else firebaseUser = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            uid: user.uid
        };

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
        const isUsernameValid = username => new Promise(resolve => {
            resolve( !/[-!$%^&*@()+|~=`\\#{}\[\]:";'<>?,.\/]/.test(username) );
        });

        return isUsernameValid(username)
            .then(isValid => {
                if (!isValid) throw { message: 'Username cannot contain special characters.' };
                else return Firebase.getUserNames();
            })
            .then(users => users.includes(username))
            .then(userExists => {
                // Throw Error if user exists
                if (userExists) throw { message: 'Username taken.' };
                // Else create user w/ email
                else return Firebase.createUser(email, pwd);
            })
            .then(({ user }) => {
                // Add username & uid to DB & state
                setUserData({ username, email, uid: user.uid });

                return Promise.all([
                    // Add User to /users/{username}
                    Firebase.addUserToDatabase(username, email, user.uid),
                    // Create User Blog at /blogs/{username}
                    Firebase.createUserBlog(username)
                ]);
            })
            .then(() => {
                setSignUpMsg(null);
                enableSignUpForm(false);
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
                enableSignInForm(false);
            })
            .catch(err => {
                setSignInMsg(err.message);
            })
            .finally(() => {
                queue.dequeue(action);
            })
        ;
    };

    const updateUserData = (username, prop, val) => {
        const action = { type: GLOBAL_UPDATE_USERDATA };

        // Queue Async Action
        queue.enqueue(action);

        return Firebase.updateUserData(username, prop, val)
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
        enableEditor,
        enableSignUpForm,
        enableSignInForm,
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