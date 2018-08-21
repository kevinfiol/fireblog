import m from 'mithril';
import { authObserver } from 'observers/index'; 
import { Layout } from 'views/Layout';
import { Index } from 'views/Index';

m.route(document.getElementById('app'), '/', {
    '/': {
        render: () => m(Layout, m(Index))
    }
});