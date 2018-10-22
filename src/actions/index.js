/** Dependencies */
import { update, initialState } from 'state';
import services from 'services';

/** Actions */
import Queue from './Queue';
const queue = Queue(update);

import Cache from './Cache';
const cache = Cache(services.LocalStore);

import Global from './Global';
const global = Global(update, queue, initialState.global, services.Firebase);

import Dashboard from './Dashboard';
const dashboard = Dashboard(update, queue, initialState.dashboard, services.Firebase);

import Profile from './Profile';
const profile = Profile(update, queue, initialState.profile, services.Firebase);

import Post from './Post';
const post = Post(update, queue, initialState.post, services.Firebase);

export default { queue, cache, global, dashboard, profile, post };