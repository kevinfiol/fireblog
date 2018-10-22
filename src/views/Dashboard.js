import m from 'mithril';
import actions from 'actions';
import { model } from 'state';

const { setCache, getCache, removeCache } = actions.cache;
const { createDashboardPostsListener }    = actions.dashboard;

export const Dashboard = () => {
    let listener;

    return {
        oninit: () => {
            listener = createDashboardPostsListener(data => {
                console.log(data);
            });
        },

        onremove: () => {
            listener();
        },

        view: () => m('.clearfix', [
            m('p', 'test')
        ])
    };
};