import m from 'mithril';
import { Btn } from 'components/Btn';

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
         * Actions
         */
        const getBlogPage = attrs.getBlogPage;

        /**
         * View
         */
        return pageNos.map(pageNo => {
            return m('span.px1', [
                m(Btn, {
                    disabled: currentPage === pageNo,
                    onclick: () => getBlogPage(username, pageNo)
                }, pageNo)
            ]);
        });
    }
};