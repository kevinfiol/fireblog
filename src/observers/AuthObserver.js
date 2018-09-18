const m = require('mithril');

module.exports = (Firebase, actions) => {
    const { setUserData, setFirebaseUser, enqueue, dequeue } = actions.global;

    let initialLoad = true;
    enqueue();

    Firebase.onAuthStateChanged(user => {
        if (user) {
            setFirebaseUser(user);

            if (initialLoad) {
                Firebase.getUserDataByEmail(user.email)
                    .then(setUserData)
                    .finally(() => {
                        dequeue();
                        initialLoad = false;

                        m.redraw();
                    })
                ;
            }
        } else {
            setFirebaseUser(null);
            setUserData(null);

            if (initialLoad) {
                dequeue();
                initialLoad = false;
            }

            m.redraw();
        }
    });
};