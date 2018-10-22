/**
 * Global Action Types
 */
const ENABLE_GLOBAL_POSTEDITOR  = 'ENABLE_GLOBAL_POSTEDITOR';
const ENABLE_GLOBAL_SIGNUP      = 'ENABLE_GLOBAL_SIGNUP';
const ENABLE_GLOBAL_SIGNIN      = 'ENABLE_GLOBAL_SIGNIN';

const SET_GLOBAL_SIGNUPMSG      = 'SET_GLOBAL_SIGNUPMSG';
const SET_GLOBAL_SIGNINMSG      = 'SET_GLOBAL_SIGNINMSG';
const SET_GLOBAL_USERDATA       = 'SET_GLOBAL_USERDATA';
const SET_GLOBAL_FIREBASEUSER   = 'SET_GLOBAL_FIREBASEUSER';

const CREATE_GLOBAL_USER        = 'CREATE_GLOBAL_USER';
const SIGNIN_GLOBAL_USER        = 'SIGNIN_GLOBAL_USER';
const UPDATE_GLOBAL_USERDATA    = 'UPDATE_GLOBAL_USERDATA';
const UPDATE_GLOBAL_EMAIL       = 'UPDATE_GLOBAL_EMAIL';
const SIGNOUT_GLOBAL_USER       = 'SIGNOUT_GLOBAL_USER';

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
        type: ENABLE_GLOBAL_POSTEDITOR,
        model: { global: { showEditor } }
    }));

    const enableSignUpForm = showSignUp => update(() => ({
        type: ENABLE_GLOBAL_SIGNUP,
        model: { global: { showSignUp } }
    }));

    const enableSignInForm = showSignIn => update(() => ({
        type: ENABLE_GLOBAL_SIGNIN,
        model: { global: { showSignIn } }
    }));

    const setSignUpMsg = signUpMsg => update(() => ({
        type: SET_GLOBAL_SIGNUPMSG,
        model: { global: { signUpMsg } }
    }));

    const setSignInMsg = signInMsg => update(() => ({
        type: SET_GLOBAL_SIGNINMSG,
        model: { global: { signInMsg } }
    }));

    /**
     * View Data
     */
    const setUserData = userData => update(() => ({
        type: SET_GLOBAL_USERDATA,
        model: { global: { userData: userData || initial.userData } }
    }));

    const setFirebaseUser = user => update(() => {
        const type = SET_GLOBAL_FIREBASEUSER;
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
        const action = { type: CREATE_GLOBAL_USER };

        // Queue Async Action
        queue.enqueue(action);

        const isUsernameValid = username => new Promise(resolve => {
            resolve( !/[-!$%^&*@()+|~=`\\#{}\[\]:";'<>?,./]/.test(username) );
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
                    Firebase.createBlog(username)
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

    const signInUser = (username, pwd) => {
        const action = { type: SIGNIN_GLOBAL_USER };

        // Queue Async Action
        queue.enqueue(action);

        return Firebase.getUserBy('username', username)
            .then(userData => {
                if (!userData || !userData.email)
                    throw { message: 'User does not exist.' };

                return Promise.all([
                    userData,
                    Firebase.signInUser(userData.email, pwd)
                ]);
            })
            .then(res => setUserData(res[0]))
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
        const action = { type: UPDATE_GLOBAL_USERDATA };

        // Queue Async Action
        queue.enqueue(action);

        return Firebase.updateUser(username, prop, val)
            .then(() => setUserData({ [prop]: val }))
            .finally(() => queue.dequeue(action))
        ;
    };

    const updateUserEmail = newEmail => {
        const action = { type: UPDATE_GLOBAL_EMAIL };
        queue.enqueue(action);

        return Firebase.updateUserEmail(newEmail)
            .finally(() => queue.dequeue(action))
        ;
    };

    const signOut = () => {
        const action = { type: SIGNOUT_GLOBAL_USER };

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
        updateUserData,
        updateUserEmail
    };
};