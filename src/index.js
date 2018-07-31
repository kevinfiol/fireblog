import m from 'mithril';
import Firebase from 'services/Firebase';
import { FIREBASE_CONFIG } from 'config';

import { Layout } from 'views/Layout';
import { Index } from 'views/Index';
import { Profiles } from 'views/Profiles';

import { Controller, Module } from 'cerebral';

Firebase.init(FIREBASE_CONFIG);
m.route.prefix('');

// actions.js
const action = ({state}) => {
    state.set('foo', 'notbar');
};

//sequences.js
const sequence = [action];

// module.js
const module = Module({
    state: {
        foo: 'bar',
        count: 0
    },
    signals: {
        init: sequence
    }
});

// model.js
const controller = Controller(module, {
    devTools: null,
    throwToConsole: true,
    stateChanges: {}
});

// // m.route(document.getElementById('app'), '/', {
// //     '/': {
// //         render: () => m(Layout, m(Index))
// //     },

// //     '/profiles': {
// //         render: () => m(Layout, m(Profiles))
// //     }
// // });

controller.on('mutation', () => {
    // m.redraw();
});

const One = {
    initializeComp: controller.getSignal('init'),

    view({state}) {
        return [
            m('p', controller.getState('foo')),
            m('button', {
                onclick: state.initializeComp
            }, 'switch')
        ];
    }
};

m.route(document.getElementById('app'), '/', {
    '/': {
        render: () => m(One)
    }
});