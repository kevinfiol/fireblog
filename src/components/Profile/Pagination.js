import m from 'mithril';
import { LoadingBtn } from 'components/LoadingBtn';

/**
 * Profile Pagination Component
 */
export const Pagination = {
    /**
     * View Method
     * @param {Object} attrs View Attributes
     */
    view: ({attrs}) => {
        /**
         * State
         */
        const pageNos = attrs.pageNos;
        const currentPage = attrs.currentPage;
        const username = attrs.username;

        /**
         * View
         */
        return [
            pageNos.map(pageNo => {
                return m('span.px1', [
                    m(LoadingBtn, {
                        className: `p1 center ${currentPage === pageNo ? 'muted c-default' : ''}`,
                        disabled: currentPage === pageNo,
                        onclick: () => {
                            m.route.set('/u/:username/:key', { username, key: pageNo });
                        }
                    }, pageNo)
                ]);
            })
        ];
    }
};