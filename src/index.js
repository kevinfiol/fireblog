import m from 'mithril';
// import meiosisTracer from 'meiosis-tracer';
import { authObserver, imgObserver } from 'observers'; 
// import { model, record } from 'state';
import { Layout } from 'views/Layout';
import { Dashboard } from 'views/Dashboard';
import { ErrorPage } from 'views/ErrorPage';
import { Profile } from 'views/Profile';
import { Post } from 'views/Post';
import { Settings } from 'views/Settings';

// meiosisTracer({ selector: '#tracer', streams: [
//     { stream: record, hide: false },
//     { stream: model, hide: false }
// ]});

const setWindow = title => {
    document.title = title;
    document.body.scrollTop = document.documentElement.scrollTop = 0;
};

m.route.prefix('');

m.route(document.getElementById('app'), '/', {
    '/': {
        onmatch: () => setWindow('Latest'),
        render: () => m(Layout, m(Dashboard))
    },

    '/u/:username': {
        onmatch: ({username}) => m.route.set('/u/:username/:pageNo', { username, pageNo: 1 })
    },

    '/u/:username/:pageNo': {
        onmatch: ({username}) => setWindow(username),
        render: ({attrs}) => m(Layout, m(Profile, { key: `${attrs.username}/${attrs.pageNo}` }))
    },

    '/p/:doc_id': {
        onmatch: ({doc_id}) => setWindow(doc_id),
        render: ({attrs}) => m(Layout, m(Post, { doc_id: attrs.doc_id }))
    },

    '/404': {
        onmatch: () => setWindow('not found'),
        render: () => m(Layout, m(ErrorPage))
    },

    '/settings': {
        onmatch: () => setWindow('settings'),
        render: () => m(Layout, m(Settings))
    }
});