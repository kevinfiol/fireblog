const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyAico7GEIIIUML-XCjwlxZ3TSPfimZfN1E',
    authDomain: 'botnet-profiles.firebaseapp.com',
    databaseURL: 'https://botnet-profiles.firebaseio.com',
    projectId: 'botnet-profiles',
    storageBucket: 'botnet-profiles.appspot.com',
    messagingSenderId: '112180117024'
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