const FIREBASE_CONFIG = {
    apiKey: ' AIzaSyDblOqjUqnpSngePzmFgPIeJ9GNuJMG9R4 ',
    authDomain: 'fireblog-3b758.firebaseapp.com',
    databaseURL: 'https://fireblog-3b758.firebaseio.com',
    projectId: 'fireblog-3b758',
    storageBucket: 'fireblog-3b758.appspot.com',
    messagingSenderId: '105146192310'
};

const RENDERER = (() => {
    const marked = require('marked');
    const r = new marked.Renderer();

    r.image = (href, title, text) => `
        <p class="center">
            <img
                class="lazy-load"
                src="${href}"
                alt="${text}"
                ${ title ? `title=${title}` : '' }
            />
        </p>
    `;

    return r;
})();

module.exports = { FIREBASE_CONFIG, RENDERER };