import m from 'mithril';
import { Btn } from 'components/Btn';

export const ConfirmBtn = () => {
    let confirm = false;

    return {
        view: ({attrs}) => m('span', { className: attrs.className }, [
            confirm
                ? [
                    m('span.btn.c-default', 'Are you sure?'),

                    m(Btn, {
                        onclick: () => { attrs.action(); confirm = false; }
                    }, 'Yes'),

                    m(Btn, { onclick: () => confirm = false }, 'No')
                ]
                : m(Btn, { onclick: () => confirm = true }, attrs.label)
            ,
        ])
    };
};