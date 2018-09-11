const m = require('mithril');

/**
 * Profile Mutators
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 * @param {Object} global   Global Mutators
 */

module.exports = (update, Firebase, global) => {
    const { enqueue, dequeue } = global;

    const setProfileData = user => update(model => {
        model.profile.user = user;
        return model;
    });

    const getProfileData = username => {
        enqueue();
        setProfileData(null);

        return Firebase.getUserDataByUsername(username)
            .then(setProfileData)
            .finally(() => {
                dequeue();
            })
        ;
    };

    return { getProfileData, setProfileData };
};