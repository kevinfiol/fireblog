/** Dependencies */
import actions from 'actions';
import services from 'services';

/** Observers */
import AuthObserver from './AuthObserver';
const authObserver = AuthObserver(services.Firebase, actions);

export default { authObserver };