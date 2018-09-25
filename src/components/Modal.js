import m from 'mithril';
import { Btn } from 'components/Btn';

export const Modal = {
    onbeforeremove({dom}) {
        dom.classList.add('exit');

        return new Promise(res => {
            dom.addEventListener('animationend', res);
        });
    },

    view({attrs, children}) {
        return m('.z4.fixed.left-0.right-0.top-0.bottom-0.white.bg-black.p3.overflow-auto', [
            m('.max-width-3.my3.mx-auto', [
                m('.col.col-12.my3', [
                    m(Btn, {
                        className: 'right mx1 btn-outline',
                        onclick: () => {
                            if (attrs.cancelMethod) attrs.cancelMethod();
                            attrs.showModal(false);
                        }
                    }, 'Cancel'),
    
                    attrs.saveMethod
                        ? m(Btn, {
                            className: 'right mx1 btn-outline',
                            disabled: attrs.disabledCondition || false,
                            onclick: () => {
                                attrs.saveMethod();
                                attrs.showModal(false);
                            }
                        }, 'Save')
                        : null
                    ,
    
                    m('.col.col-12.mt2', children)
                ])
            ])
        ]);
    }
};