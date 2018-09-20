/**
 * Profile Action Types
 */

const PROFILE_SET_PROFILEDATA = 'PROFILE_SET_PROFILEDATA';
const PROFILE_GET_PROFILEDATA = 'PROFILE_GET_PROFILEDATA';

/**
 * Profile Actions
 * @param {Stream} update   Update Stream
 * @param {Object} Firebase FirebaseService
 * @param {Object} queue    Queue Actions
 */

module.exports = (update, Firebase, queue) => {
    const setProfileData = user => update(() => ({
        type: PROFILE_SET_PROFILEDATA,
        model: { profile: { user } }
    }));

    const getProfileData = username => {
        const action = { type: PROFILE_GET_PROFILEDATA };
        queue.enqueue(action);

        setProfileData(null);
        return Firebase.getUserDataByUsername(username)
            .then(setProfileData)
            .finally(() => queue.dequeue(action))
        ;
    };

    return { getProfileData, setProfileData };
};