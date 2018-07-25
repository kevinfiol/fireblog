import m from 'mithril';
import Firebase from 'services/Firebase';
import { FIREBASE_CONFIG } from 'config';

import { Layout } from 'views/Layout';
import { Index } from 'views/Index';
import { Profiles } from 'views/Profiles';


Firebase.init(FIREBASE_CONFIG);
m.route.prefix('');

m.route(document.getElementById('app'), '/', {
    '/': {
        render: () => m(Layout, m(Index))
    },

    '/profiles': {
        render: () => m(Layout, m(Profiles))
    }
});