/** Dependencies */
import { update } from 'state';
import { Firebase } from 'services/index';

/** Mutators */
import Global from 'mutators/Global';
const global = Global(update, Firebase);

import Profile from 'mutators/Profile';
const profile = Profile(update, Firebase, global);

export const mutators = { global, profile };