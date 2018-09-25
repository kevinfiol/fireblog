const compose = (...fs) => x => fs.reduceRight((val, f) => f(val), x);

const range = num => {
    const values = [];

    for (let i = 0; i < num; i += 1) {
        values.push(i);
    }

    return values;
};

const Pager = (initialPages = null, MAX_LENGTH = 7) => {
    const pages = initialPages || { 1: { pageNo: 1, posts: [] } };
    let pageCount = 1;

    // Private Methods
    const createNewPage = () => {
        pageCount += 1;
        pages[`${pageCount}`] = { pageNo: pageCount, posts: [] };
    };

    const getPageKeys = () => Object.keys(pages);

    // Public Methods
    const getPageNumbers = () => {
        return Object.keys(pages)
            .map(Number)
            .sort()
        ;
    };

    const addPost = post => {
        let pageKeys = getPageKeys();

        for (let i = 0; i < pageKeys.length; i++) {
            const k = pageKeys[i];
            let next = pageKeys[i + 1];

            if (pages[k].pageNo === 1) {
                pages[k].posts.unshift(post);
            }

            if (pages[k].posts.length > MAX_LENGTH) {
                const tail = pages[k].posts.pop();

                if (next === undefined) {
                    createNewPage();
                    pageKeys = getPageKeys();
                    next = pageKeys[i + 1];
                }

                pages[next].posts.unshift(tail);
            }
        }
    };

    const getPages = () => pages;

    const getPage = pageNo => pages[`${pageNo}`] || null;

    return {
        addPost,
        getPage,
        getPages,
        getPageNumbers
    };
};

export { compose, range, Pager };