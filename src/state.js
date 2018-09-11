import stream from 'mithril/stream';

const initialState = {
    global: {
        userData: {
            username: null,
            uid: null,
            photoURL: null,
            bio: null
        },
        firebaseUser: null,
        signUpMsg: null,
        signInMsg: null,
        showSignUp: false,
        showSignIn: false,
        isLoading: false,
        queue: []
    },

    profile: {
        user: null,
    }
};

const update = stream();
const model = stream.scan((x, f) => f(x), initialState, update);

export { update, model, initialState };