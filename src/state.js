import stream from 'mithril/stream';
import merge from 'deepmerge';

const initialState = {
    queue: [],
    isLoading: false,

    global: {
        userData: {
            username: null,
            email: null,
            uid: null,
            photoURL: null,
            bio: null
        },
        firebaseUser: {
            displayName: null,
            email: null,
            photoURL: null,
            emailVerified: null,
            uid: null
        },
        signUpMsg: null,
        signInMsg: null,
        showSignUp: false,
        showSignIn: false,
    },

    profile: {
        user: {
            username: null,
            bio: null,
            email: null,
            photoURL: null,
            uid: null
        },
        blog: {
            page: { pageNo: null, posts: null },
            pageNumbers: []
        },
        showEditor: false,
    },

    post: {
        title: null,
        date: null,
        content: null
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
        // Merge with empty object if action doesn't modify model
        action.model || {},
        // Deepmerge overwrites array properties
        { arrayMerge: (x, y) => y }
    );
};

// Model
const model = stream.scan(reducer, initialState, update);

export { record, update, model, initialState };