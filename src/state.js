import stream from 'mithril/stream';
import merge from 'deepmerge';

const initialState = {
    queue: [],
    isLoading: false,

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
    },

    profile: {
        user: null,
    }
};

// Record of Actions
const record = stream();

// Update Stream
const update = stream();

// Reducer
const reducer = (model, f) => {
    const action = f(model);
    record(action);

    return merge(
        // Latest Model
        model,
        // Return empty object if action doesn't modify model
        action.model || {},
        // Deepmerge overwrites array properties
        { arrayMerge: (x, y) => y }
    );
};

// Model
const model = stream.scan(reducer, initialState, update);

export { record, update, model, initialState };