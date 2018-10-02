import m from 'mithril';
import { Btn } from 'components/Btn';

export const Pagination = {
    view: ({attrs}) => {
        return attrs.pageNos.map(pageNo => {
            return m('span.px1', [
                m(Btn, {
                    disabled: attrs.currentPage === pageNo,
                    onclick: () => attrs.getBlogPage(attrs.username, pageNo)
                }, pageNo)
            ]);
        });
    }
};