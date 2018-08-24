import m from 'mithril';
import { Button } from 'components/Button';

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
                    m(Button, {
                        className: 'right mx1',
                        onclick: () => {
                            if (attrs.cancelMethod) attrs.cancelMethod();
                            attrs.showModal(false);
                        }
                    }, 'Cancel'),
    
                    attrs.saveMethod
                        ? m(Button, {
                            className: 'right mx1',
                            onclick: () => {
                                attrs.saveMethod();
                                attrs.showModal(false);
                            }
                        }, 'Save')
                        : null
                    ,
    
                    children
                ])
            ])
        ]);
    }
};