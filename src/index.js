import m from 'mithril';
import observers from 'observers'; 
import meiosisTracer from 'meiosis-tracer';
import { model, record } from 'state';
import { Layout } from 'views/Layout';
import { Index } from 'views/Index';
import { Profile } from 'views/Profile';
import { Post } from 'views/Post';
import { Settings } from 'views/Settings';

meiosisTracer({ selector: '#tracer', streams: [ { stream: record, hide: false }, { stream: model, hide: false } ] });
model.map(() => setTimeout(m.redraw, 2));

m.route(document.getElementById('app'), '/', {
    '/': {
        render: () => m(Layout, m(Index))
    },

    '/u/:key': {
        render: ({key}) => m(Layout, m(Profile, { key }))
    },

    '/u/:key/blog/:pageNo/:postNo': {
        render: ({key, attrs}) => m(Layout, m(Post, { key, pageNo: attrs.pageNo, postNo: attrs.postNo }))
    },

    '/settings': {
        render: () => m(Layout, m(Settings))
    }
});