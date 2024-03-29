const intlNF = new Intl.NumberFormat("de-DE", {  minimumFractionDigits: 1, maximumFractionDigits: 3 });

/**
 * Prints an error message to the console
 * Does not print anything if NODE_ENV is not set to development
 * @param {*} error Either a custom message or an error object
 */
function printDevelopmentError(error) {
    const dev = process.env.NODE_ENV === 'development';
    if (!dev) {
        return;
    }

    // eslint-disable-next-line no-console
    console.info(error);
}

/**
 * Parses the input to a float.
 * Handles commas and points as denotion for decimal values if money was a string
 * If money is not a number or string, 0.0 is returned
 * @param {*} money
 * @returns {number} The parsed value
 */
export function moneyStyler(money) {
    let result = money;
    // Make sure we got a proper value
    if (money === null || money === undefined) {
        result = 0.0;
        printDevelopmentError('[MoneyStyler] Value was undefined or null, using 0.0');
    }

    if (typeof money === 'object' || typeof money === 'function') {
        result = 0.0;
        printDevelopmentError('[MoneyStyler] Value was object or function , using 0.0');
    }

    if (money === '') {
        result = 0.0;
        printDevelopmentError('[MoneyStyler] Value was empty string, using 0.0');
    }

    // parse the string to a float
    if (typeof result === 'string') {
        result = result.replace(',', '.');
        result = parseFloat(result);
    }

    if (Number.isNaN(result)) {
        result = 0.0;
        printDevelopmentError('[MoneyStyler] Value was NaN, using 0.0');
    }

    return result.toFixed(2);
}

export const quantityStyler = quantity => intlNF.format(quantity);

/**
 * Stop the propagation of the event, so that the on:click action of the parent element is not executed.
 * BrowserSupport: https://caniuse.com/?search=stopPropagation
 * @param {MouseEvent | TouchEvent | PointerEvent} event Event produced by i.e. on:click
 */
export function stopPropagation(event) {
    event.stopPropagation();
}

/**
 * Small Svelte actions to fire on enter keypresses: https://svelte.dev/tutorial/actions
 * @param node html node
 */
export function submit(node) {
    node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            node.dispatchEvent(new CustomEvent('enter'));
        }
    });

    return {
        destroy() {
            node.removeEventListener('keydown', undefined);
        }
    };
}
