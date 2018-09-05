const m = require('mithril');

module.exports = (Firebase, mutators) => {
    const { setUserData, setFirebaseUser, enqueue, dequeue } = mutators;

    let initialLoad = true;
    if (initialLoad) enqueue();
    // if (initialLoad) toggleLoading(true);

    Firebase.onAuthStateChanged(user => {
        if (user) {
            setFirebaseUser(user);

            if (initialLoad) {
                Firebase.getUserDataByEmail(user.email)
                    .then(setUserData)
                    .finally(() => {
                        console.log('here');
                        dequeue();
                        // toggleLoading(false);
                        initialLoad = false;
                        m.redraw();
                    })
                ;
            }
        } else {
            setFirebaseUser(null);
            setUserData(null);

            if (initialLoad) {
                console.log('here');
                dequeue();
                // toggleLoading(false);
                initialLoad = false;
            }

            m.redraw();
        }
    });
};