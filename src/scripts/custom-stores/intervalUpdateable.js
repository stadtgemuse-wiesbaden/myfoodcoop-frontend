import { updateable } from './updateableStore';

/**
 * Creates a custom svelte store which provides the possibilie to call .forceUpdate() on any store to refresh its 
 * values. As this is a store the updated value will take affect everywhere in the frontend without explicitly resetting
 * those values. Additionally this store provides the ability to update the data periodically.
 * Have a look here for a tutorial about custom stores: https://svelte.dev/tutorial/custom-stores
 * @param {number} repeatMs Milliseconds after which the call to `updateCallback` should reoccur
 * @param {(set) => {}} updateCallback Function that should be called when an update is necessary,
 * i.e. through a request to store.forceUpdate()
 */
export function intervalUpdateable(repeatMs, updateCallback) {
    // Store the interval, so we have the possibility to clear it
    let interval;

    // called when an update is necessary, i.e. through a request to store.forceUpdate() or the interval
    function updateCallbackInternal(set) {
        updateCallback(set);
    }

    // called after the first subscriber has successfully subscribed to the store
    function firstSubscribe(set) {
        // start the interval with the specified duration
        interval = setInterval(() => {
            // call the updatecallback
            updateCallbackInternal(set);
        }, repeatMs);
    }

    // called after the last subscriber has successfully unsubscribed from the store
    function lastUnsubscribe() {
        // clear the interval
        clearInterval(interval);
    }

    // return the svelte custom store
    return updateable(updateCallbackInternal, firstSubscribe, lastUnsubscribe)
}

/**
 * Define a few common intervals that can be passed as `repeatMs` for `intervalUpdateable`
 */
export const Intervals = {
    TEN_SECONDS: 1000 * 10,
    ONE_MINUTE: 1000 * 60,
    TWO_MINUTES: 1000 * 60 * 2,
    FIVE_MINUTES: 1000 * 60 * 5,
}