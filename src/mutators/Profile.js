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

    const getProfileData = username => {
        return Firebase.getUserDataByUsername(username)
            .then(res => console.log(res))
        ;
    };

    return { getProfileData };
};