/** Dependencies */
import { update } from 'state';
import { Firebase } from 'services/index';

/** Mutators */
import Global from 'mutators/Global';

export default {
    global: Global(update, Firebase)
};