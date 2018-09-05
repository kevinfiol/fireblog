const m = require('mithril');
require('core-js/modules/es7.promise.finally');

/**
 * Profile Mutators
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 * @param {Object} global   Global Mutators
 */

module.exports = (update, Firebase, global) => {
    const { toggleLoading } = global;

    const setProfileData = user => update({
        profile: { user }
    });

    const getProfileData = username => {
        setProfileData(null);
        toggleLoading(true);

        return Firebase.getUserDataByUsername(username)
            .then(setProfileData)
            .finally(() => {
                toggleLoading(false);
                m.redraw();
            })
        ;
    };

    return { getProfileData, setProfileData };
};