<script>
    /**
     * Defines if the item should be clickable
     * Default: false
     */
    export let isClickable = false;

    /**
     * Defines the size of the component.
     * One of: medium, small
     * Default: medium
     */
    export let size = 'medium';

    /*
     * Defines if the item should be highlighted
     * Default: false
     */
    export let highlight = false;

    export let highlightBackground = '';
</script>

<style>
    .list-item {
        border-radius: 6px;
        box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0px 0 1px rgba(10, 10, 10, 0.02);
        color: #000;
        display: block;
        padding: 1.25rem;
        margin-top: 20px;
    }

    .small {
        margin-top: 5px;
        padding: 0.75rem;
    }

    .highlight {
        box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0px 0 1px rgba(255, 0, 0, 0.4);
    }

    .is-clickable {
        cursor: pointer;
    }
    div {
        background-color: aquamarin;
    }
    .bg-highlight-out-of-stock {
        background-color: tomato;
    }
    .bg-highlight-in-stock {
        background-color: lightseagreen;
    }
    .bg-highlight-ordered {
        background-color: cornflowerblue;
    }
    .bg-highlight-spoiled-soon {
        background-color: gold;
    }
</style>

<div
    class="list-item {highlightBackground}"
    class:is-clickable={isClickable}
    class:highlight
    class:small={size === 'small'}
    on:click
>
    <slot />
</div>
