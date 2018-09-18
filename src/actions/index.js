/** Dependencies */
import { update } from 'state';
import services from 'services';

/** Actions */
import Global from './Global';
const global = Global(update, services.Firebase);

import Profile from './Profile';
const profile = Profile(update, services.Firebase, global);

export default { global, profile };