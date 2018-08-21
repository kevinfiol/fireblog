import m from 'mithril';

export const Spinner = {
    view() {
        return m('.loading.p4.top-0.left-0.right-0.center', {
            style: { position: 'absolute', zIndex: '9999' }
        });
    }
};