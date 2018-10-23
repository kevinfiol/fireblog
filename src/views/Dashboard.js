import m from 'mithril';
import actions from 'actions';
import { model } from 'state';
import { EmptyState } from 'components/EmptyState';
import { Post } from 'components/Dashboard/Post';

const { setCache, getCache } = actions.cache;
const { setDashboard, getDashboardPosts, createDashboardPostsListener } = actions.dashboard;

export const Dashboard = () => {
    /**
     * Local State
     */
    let listener;

    return {
        /**
         * Oninit Method
         */
        oninit: () => {
            const route = m.route.get();
            const cache = getCache(route);

            if (cache) setDashboard(cache);

            listener = createDashboardPostsListener(data => {
                if (cache) {
                    const cachedTS = new Date(cache.timestamp).getTime();
                    const dataTS = new Date(data.timestamp).getTime();
                    if (cachedTS >= dataTS) return;
                }

                setDashboard({ timestamp: data.timestamp });

                getDashboardPosts().then(() => {
                    setCache(route, model().dashboard);
                });
            });
        },

        onremove: () => {
            listener();
        },

        view: () => {
            /**
             * State
             */
            const isLoading = model().isLoading;
            const posts     = model().dashboard.posts;

            /**
             * Computed
             */
            const isPosts = posts && posts.length > 0;

            /**
             * View
             */
            return [
                m('h3', 'latest'),

                isPosts
                    ? posts.map(post => m('.my3', m(Post, { post })) )
                    : isLoading ? null : m(EmptyState, 'Somehow, there are no posts to display.')
                ,
            ];
        }
    };
};