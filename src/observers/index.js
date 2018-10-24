/** Dependencies */
import actions from 'actions';
import services from 'services';

/** Observers */
import AuthObserver from './AuthObserver';
const authObserver = AuthObserver(services.Firebase, actions);

import lozad from 'lozad';
const imgObserver = lozad('.lazy-load', {
    rootMargin: '250px 0px'
});

export { authObserver, imgObserver };