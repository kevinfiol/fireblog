const m = require('mithril');

module.exports = (Firebase, mutators) => {
    const { setUserData, setFirebaseUser, enqueue, dequeue } = mutators;

    let initialLoad = true;
    if (initialLoad) enqueue();

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