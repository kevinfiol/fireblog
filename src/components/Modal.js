import m from 'mithril';
import { Button } from 'components/Button';

export const Modal = {
    onbeforeremove({dom}) {
        dom.classList.add('exit');
        return new Promise(res => {
            setTimeout(res, 60);
        });
    },

    view({attrs, children}) {
        return m('.z4.fixed.left-0.right-0.top-0.bottom-0.white.bg-black.p4.modal.overflow-auto', [
            m('.clearfix.max-width-3.mx-auto', { style: { minWidth: '768px' } }, [
                m('.clearfix.col.col-12.my3', [
                    m(Button, {
                        class: 'right mx1',
                        onclick: () => {
                            if (attrs.cancelMethod) attrs.cancelMethod();
                            attrs.showModal(false);
                        }
                    }, 'Cancel'),

                    attrs.saveMethod
                        ? m(Button, {
                            class: 'right mx1',
                            onclick: () => {
                                attrs.saveMethod();
                                attrs.showModal(false);
                            }
                        }, 'Save')
                        : null
                    ,
                ]),

                children
            ])
        ]);
    }
};