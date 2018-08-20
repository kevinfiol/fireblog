/** Dependencies */
import { global } from 'mutators';
import { Firebase } from 'services/index';

/** Observers */
import AuthObserver from 'observers/AuthObserver';
const authObserver = AuthObserver(Firebase, global);

export {
    authObserver
};