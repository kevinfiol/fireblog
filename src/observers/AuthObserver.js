const m = require('mithril');

module.exports = (Firebase, actions) => {
    const { setUserData, setFirebaseUser } = actions.global;
    const { enqueue, dequeue } = actions.queue;
    const action = { type: 'OBSERVER_AUTH_ON_STATE_CHANGED' };

    let initialLoad = true;
    enqueue(action);

    Firebase.onAuthStateChanged(user => {
        if (user) {
            setFirebaseUser(user);

            if (initialLoad) {
                Firebase.getUserDataByEmail(user.email)
                    .then(setUserData)
                    .finally(() => {
                        dequeue(action);
                        initialLoad = false;
                        m.redraw();
                    })
                ;
            }
        } else {
            setFirebaseUser(null);
            setUserData(null);

            if (initialLoad) {
                dequeue(action);
                initialLoad = false;
            }

            m.redraw();
        }
    });
};