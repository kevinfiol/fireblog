import m from 'mithril';

export const Modal = {
    onbeforeremove({dom}) {
        dom.classList.add('exit');
        return new Promise(res => setTimeout(res, 120));
    },

    view({attrs, children}) {
        return m('.z4.fixed.left-0.right-0.top-0.bottom-0.white.bg-black.p4.modal.overflow-auto', [
            m('.clearfix.max-width-3.mx-auto', { style: { minWidth: '768px' } }, [
                m('.clearfix.col.col-12.my3', [
                    m('button.btn.btn-outline.right.mx1', {
                        onclick: () => {
                            if (attrs.cancelMethod) attrs.cancelMethod();
                            attrs.showModal(false);
                        }
                    }, 'cancel'),

                    attrs.saveMethod
                        ? m('button.btn.btn-outline.right.mx1', {
                            onclick: () => {
                                attrs.saveMethod();
                                attrs.showModal(false);
                            }
                        }, 'save')
                        : null
                    ,
                ]),

                children
            ])
        ]);
    }
};