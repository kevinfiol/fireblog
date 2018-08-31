import m from 'mithril';
import meiosisTracer from 'meiosis-tracer';
import { model } from 'state';
import { authObserver } from 'observers/index'; 
import { Layout } from 'views/Layout';
import { Index } from 'views/Index';
import { Profile } from 'views/Profile';
import { Settings } from 'views/Settings';

meiosisTracer({ selector: '#tracer', streams: [ { stream: model, hide: false } ] });
model.map(m.redraw);

m.route(document.getElementById('app'), '/', {
    '/': {
        render: () => m(Layout, m(Index))
    },

    '/user/:key': {
        render: ({key}) => m(Layout, m(Profile, { key }))
    },

    '/settings': {
        render: () => m(Layout, m(Settings))
    }
});