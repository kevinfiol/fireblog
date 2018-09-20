const m = require('mithril');

/**
 * Queue Action Types
 */

const QUEUE_SET_LOADING = 'QUEUE_SET_LOADING';
const QUEUE_ENQUEUE     = 'QUEUE_ENQUEUE';
const QUEUE_DEQUEUE     = 'QUEUE_DEQUEUE';

/**
 * Queue Actions
 * @param {Stream} update   Update Stream
 */

module.exports = update => {
    const setLoading = isLoading => update(() => ({
        type: QUEUE_SET_LOADING,
        model: { isLoading }
    }));

    const enqueue = action => {
        const type = QUEUE_ENQUEUE;

        // Record Action
        update(() => action);
        
        // Enqueue action
        update(model => {
            const queue = [...model.queue];
            queue.push(action);
            return { type, model: { queue } };
        });
        
        // Set Loading
        setLoading(true);
        setTimeout(m.redraw);
    };

    const dequeue = action => {
        const type = QUEUE_DEQUEUE;
        let queueLength = null;

        // Dequeue
        update(model => {
            const queue = [...model.queue];
            let index = null;
            
            for (let i = 0; i < queue.length; i++) {
                if (queue[i].type === action.type) {
                    index = i;
                    break;
                } 
            }

            queue.splice(index, 1);
            queueLength = queue.length;
            return { type, model: { queue } };
        });

        // Set Loading
        setLoading(queueLength > 0);
        setTimeout(m.redraw);
    };

    return { enqueue, dequeue };
};