/** Dependencies */
import { mutators } from 'mutators/index';
import { Firebase } from 'services/index';

/** Observers */
import AuthObserver from 'observers/AuthObserver';
const authObserver = AuthObserver(Firebase, mutators.global);

export {
    authObserver
};