/** Dependencies */
import { update } from 'state';
import services from 'services';

/** Actions */
import Queue from './Queue';
const queue = Queue(update);

import Global from './Global';
const global = Global(update, services.Firebase, queue);

import Profile from './Profile';
const profile = Profile(update, services.Firebase, queue);

import Post from './Post';
const post = Post(update, services.Firebase, queue);

export default { queue, global, profile, post };