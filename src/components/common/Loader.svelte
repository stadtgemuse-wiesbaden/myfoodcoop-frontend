<script>
    /**
     * Defines if the loading spinner should be displayed.
     * Default: false
     */
    export let isLoading = false;

    /**
     * The size the Loader should have.
     * One of medium, big.
     * Default: medium
     */
    export let size = 'medium';
</script>

<style>
    .loader-spinner {
        position: relative;
        margin: 0 auto;
        width: 64px;
        height: 64px;
    }

    .big {
        width: 100px;
        height: 100px;
    }

    .loader-spinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .circular {
        animation: rotate 2s linear infinite;
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }

    .path {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
        stroke: #375a7f;
        animation: dash 1.5s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
</style>

{#if isLoading}
    <div class="loader-spinner" class:big={size === 'big'}>
        <svg class="circular" viewBox="25 25 50 50">
            <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10" />
        </svg>
    </div>
{/if}
