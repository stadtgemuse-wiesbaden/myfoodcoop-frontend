<script>
    import { goto } from '@sapper/app';
    import { mdiLogout, mdiRefresh, mdiPencil, mdiOpenInNew } from '@mdi/js';
    import { title, navBalance, isPointOfSales } from '../../stores/page';
    import Button from '../../components/common/Button.svelte';
    import { userName, refreshToken } from '../../stores/user';
    import { userDetails } from '../../stores/userDetails';
    import UserDetails from '../../components/user/UserDetails.svelte';
    import AuthorizeByRoles, { Roles } from '../../components/common/AuthorizeByRoles.svelte';
    import Switch from '../../components/common/Switch.svelte';
    import Icon from '../../components/common/Icon.svelte';
    import User from '../../scripts/user/User';
    import Fetch from '../../scripts/api/Fetch';
    import LocalStorageKeys from '../../scripts/common/LocalStorageKeys';
    import { appVersion } from '../../scripts/api/ApiConfig';
    import {
        POINT_OF_SALES_INACTIVITY_TIMEOUT_IN_MINUTES,
        POINT_OF_SALES_MAX_LOGIN_TIME_IN_MINUTES,
        LEGAL_NOTICE_LINK,
    } from '../../scripts/Config';

    // eslint-disable-next-line prefer-const, no-unused-vars
    $title = 'Profil';
    // eslint-disable-next-line prefer-const, no-unused-vars
    $navBalance = 'show';

    let isLoggingOut = false;
    let isReloading = false;

    $: {
        // disallow the future use of the keep logged in workflow
        localStorage.setItem(LocalStorageKeys.IS_POINT_OF_SALES, $isPointOfSales);

        if ($isPointOfSales === true) {
            // if we are a point of sales system, disable the use of the future use of the keep logged in functionality
            localStorage.setItem(LocalStorageKeys.KEEP_LOGGED_IN, false);
        }
    }

    async function logout() {
        try {
            isLoggingOut = true;

            await User.logout();
        } catch (error) {
            // catch errors, but do not show it to the user
        } finally {
            isLoggingOut = false;
        }
    }

    async function reloadUserData() {
        try {
            isReloading = true;
            await Fetch.refreshToken($refreshToken);

            // update UserDetails View
            userDetails.forceUpdate();
        } catch (error) {
            // catch errors, but do not show it to the user
        } finally {
            isReloading = false;
        }
    }
</script>

<style>
    .pointer {
        cursor: pointer;
    }
</style>

<div class="columns is-mobile">
    <div class="column">
        <div class="is-size-3 has-text-weight-bold pb-5">{$userName}</div>
    </div>
    <div class="column has-text-right pointer is-one-quarter" on:click={() => goto('/profile/edit/data')}>
        <Icon icon={mdiPencil} appbar={true} />
    </div>
</div>

{#if $userDetails}
    <UserDetails user={$userDetails} showRoles={true} version={appVersion} />

    <AuthorizeByRoles allowedRoles={[Roles.ADMIN]} displayPermissionNotAllowed={false}>
        <hr />

        <div class="columns mt-3">
            <div class="column">
                Point of Sales Regeln für dieses Gerät aktivieren?<br />
                - Ausloggen nach
                {POINT_OF_SALES_INACTIVITY_TIMEOUT_IN_MINUTES}
                Minuten.<br />
                - Maximale Login Dauer
                {POINT_OF_SALES_MAX_LOGIN_TIME_IN_MINUTES}
                Minuten.<br />
                Wichtig: Wirkt sich erst ab dem nächsten Login aus.
            </div>
            <div class="column has-text-right">
                <Switch twoColor={true} bind:checked={$isPointOfSales} />
            </div>
        </div>

        <hr />
    </AuthorizeByRoles>

    <div class="container has-text-centered mt-6">
        <Button
            text="Benutzerdaten neu laden"
            class="is-primary mb-3"
            on:click={reloadUserData}
            size="full-width"
            isLoading={isReloading}
            icon={mdiRefresh}
        />
        <br />
        <Button
            text="Ausloggen"
            class="is-danger mb-3"
            on:click={logout}
            size="full-width"
            isLoading={isLoggingOut}
            icon={mdiLogout}
        />
        <br />
        <Button text="Passwort ändern" class="is-link mb-3" href="/profile/edit/password" size="full-width" />
        {#if LEGAL_NOTICE_LINK}
            <br />
            <Button
                text="Impressum"
                class="is-link mb-3"
                href={LEGAL_NOTICE_LINK}
                target="_blank"
                size="full-width"
                icon={mdiOpenInNew}
            />
        {/if}
        <br />
        <Button goHome={true} size="full-width" />
    </div>
{/if}
