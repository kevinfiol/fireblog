import Firebase from 'services/Firebase';

const state = {
    global: {
        user: null,
    },

    Index: {
        count: 100
    },

    Profiles: {
        count: 200
    }
};

const methods = {
    global: {
        assignUser(user) {
            state.global.user = user;
            return state.global.user;
        }
    },

    Index: {
        addToCount(num) {
            state.Index.count += num;
            return state.Index.count;
        },

        subtractFromCount(num) {
            state.Index.count -= num;
            return state.Index.count;
        }
    }
};

export {
    methods.global.assignUser as assignUser,
};