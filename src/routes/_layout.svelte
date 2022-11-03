<script>
    import { stores } from '@sapper/app';
    import { Duration } from 'luxon';
    import { onMount } from 'svelte';
    import BulmaGlobalStyles from '../components/BulmaGlobalStyles.svelte';
    import EnsureLogin from '../components/common/EnsureLogin.svelte';
    import Nav from '../components/Nav.svelte';
    import Appbar from '../components/Appbar.svelte';
    import { stockItems } from '../stores/stock';
    import { backendUrl, isBackendActive, isPointOfSales } from '../stores/page';
    import User from '../scripts/user/User';
    import {
        POINT_OF_SALES_INACTIVITY_TIMEOUT_IN_MINUTES,
        POINT_OF_SALES_MAX_LOGIN_TIME_IN_MINUTES,
    } from '../scripts/Config';
    import LocalStorageKeys from '../scripts/common/LocalStorageKeys';
    import Toast from '../components/common/Toast.svelte';
    import Loader from '../components/common/Loader.svelte';

    const { page, session } = stores();

    // eslint-disable-next-line prefer-const, no-unused-vars
    $backendUrl = $session.BACKEND_API_URL;

    let isLoggedIn = false;
    let hasUpdatedStockAfterMount = false;
    let interactionTimeout;

    // true, if the page should be displayed even if the user is not logged in
    let displayPageIgnoringLoginStatus = false;

    $: {
        // update the status as soon as the page store updates
        displayPageIgnoringLoginStatus =
            $page.path.includes('/login') || $page.path.includes('/register') || $page.error;
    }

    $: {
        if (isLoggedIn && !hasUpdatedStockAfterMount) {
            // update stock items after page load and after the user is logged in
            stockItems.forceUpdate();
            hasUpdatedStockAfterMount = true;

            if ($isPointOfSales) {
                // if we are on a point of sales system, only allow the user to stay logged in x minutes
                setTimeout(logoutUser, Duration.fromObject({ minutes: POINT_OF_SALES_MAX_LOGIN_TIME_IN_MINUTES }));
            }
        }
    }

    onMount(() => {
        const isPointOfSaelsCookieValue = localStorage.getItem(LocalStorageKeys.IS_POINT_OF_SALES);
        // if the cookie is not set or the cookie value equals to true, allow to check keepLoggedIn
        // eslint-disable-next-line no-unused-vars
        $isPointOfSales = isPointOfSaelsCookieValue === 'true';
    });

    function userInteraction() {
        // only check for inactivity if we are on a point of sales system
        if (!$isPointOfSales) {
            return;
        }

        // only check if the user is logged in
        if (!isLoggedIn) {
            return;
        }

        // clear the old interval if it exists
        if (interactionTimeout) {
            clearTimeout(interactionTimeout);
        }

        // logout the user if he was inactive for x minutes
        interactionTimeout = setTimeout(
            logoutUser,
            Duration.fromObject({ minutes: POINT_OF_SALES_INACTIVITY_TIMEOUT_IN_MINUTES })
        );
    }

    async function logoutUser() {
        isLoggedIn = false;
        await User.logout();
    }
</script>

<style>
    @media (max-width: 920px) {
        main {
            border-radius: 26px !important;
            margin-top: -29px;
            background: white;
            min-height: 60px;
            padding-bottom: 125px;
        }
    }

    @media (min-width: 921px) and (max-width: 1023px) {
        main {
            padding-bottom: 100px;
        }
    }
</style>

<!-- attach a few events to the body to check if the user is still active -->
<svelte:body
    on:click={userInteraction}
    on:mousemove={userInteraction}
    on:keydown={userInteraction}
    on:scroll={userInteraction}
    on:pointerdown={userInteraction}
/>

<BulmaGlobalStyles />
<EnsureLogin bind:isLoggedIn />
<Nav bind:isLoggedIn />
<Toast />

<main>
    {#if !$isBackendActive && !displayPageIgnoringLoginStatus}
        <!-- Only display this loader if we are not on the login, the register or an error page -->
        <Loader isLoading={true} />
        <div class="has-text-centered"><span>Die Applikation wird gestartet...</span></div>
    {/if}

    <!-- Only allow the user to visit the page if he is logged in, he tries to login, or if an error occured -->
    {#if isLoggedIn || displayPageIgnoringLoginStatus}
        <slot />
    {/if}
</main>
{#if isLoggedIn}
    <Appbar />
{/if}
