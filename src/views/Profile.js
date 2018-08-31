import m from 'mithril';
import { mutators } from 'mutators/index';

const { getProfileData } = mutators.profile;

export const Profile = {
    oninit: ({attrs}) => {
        getProfileData(attrs.key);
    },

    view: ({attrs}) => m('.clearfix', [
        m('h3', attrs.key)
    ])
};