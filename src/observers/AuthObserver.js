const m = require('mithril');

module.exports = (Firebase, mutators) => {
    const { setUserData, setFirebaseUser, toggleLoading } = mutators;

    let initialLoad = true;
    if (initialLoad) toggleLoading(true);

    Firebase.onAuthStateChanged(user => {
        if (user) {
            setFirebaseUser(user);

            if (initialLoad) {
                Firebase.getUserDataByEmail(user.email)
                    .then(setUserData)
                    .finally(() => {
                        toggleLoading(false);
                        initialLoad = false;
                        m.redraw();
                    })
                ;
            }
        } else {
            setFirebaseUser(null);
            setUserData({ uid: null, username: null, photoURL: null });

            if (initialLoad) {
                toggleLoading(false);
                initialLoad = false;
            }

            m.redraw();
        }
    });
};