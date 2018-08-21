/** Dependencies */
import { update } from 'state';
import { Firebase } from 'services/index';

/** Mutators */
import Global from 'mutators/Global';

export const mutators = {
    global: Global(update, Firebase)
};