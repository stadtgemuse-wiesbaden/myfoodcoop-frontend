<script>
    import { onMount } from 'svelte';
    import { goto } from '@sapper/app';
    import AuthorizeByRoles, { Roles } from '../../components/common/AuthorizeByRoles.svelte';
    import ErrorModal from '../../components/common/ErrorModal.svelte';
    import { title, navBalance } from '../../stores/page';
    import NoData from '../../components/common/NoData.svelte';
    import TextField from '../../components/common/TextField.svelte';
    import UserListItem from '../../components/user/UserListItem.svelte';
    import Loader from '../../components/common/Loader.svelte';
    import User from '../../scripts/user/User';
    import Button from '../../components/common/Button.svelte';
    import Pagination from '../../components/pagination/Pagination.svelte';

    // eslint-disable-next-line prefer-const, no-unused-vars
    $title = 'Benutzerliste';
    // eslint-disable-next-line prefer-const, no-unused-vars
    $navBalance = 'hidden';

    let requestError;
    let searchTerm;
    let searchTermElement;

    let allUsers = [];
    let notActivatedUsers = [];
    let activatedUsers = [];
    let isLoading = true;

    onMount(async () => {
        try {
            // allUsers = await UserList.getActivatedUsers();
            allUsers = await User.getAllUsers();
            allUsers = allUsers.users;

            notActivatedUsers = allUsers.filter((user) => user.roles.length === 0);
            activatedUsers = allUsers.filter((user) => user.roles.length > 0);

            notActivatedUsersPageCount = Math.ceil(notActivatedUsers.length / notActivatedUsersPageSize);
            activatedUsersPageCount = Math.ceil(activatedUsers.length / activatedUsersPageSize);
        } catch (error) {
            requestError = error;
        } finally {
            isLoading = false;
        }
    });

    function onSearchTermChange() {
        searchTerm = searchTermElement.getValue();
    }

    // Pagination
    //
    // Performing client-side pagination (instead of server-side) because filtering items
    // requires more items than contained within a single page delivered by the backend.
    // Otherwise, pages would contain few or no items at all after filtering. Also,
    // calculating the total number of pages after filting requires knowledge about all items.

    let notActivatedUsersCurrentPage = 0;
    const notActivatedUsersPageSize = 10;
    let notActivatedUsersPageCount;
    let notActivatedUsersOffset = notActivatedUsersCurrentPage * notActivatedUsersPageSize;

    /**
     * Called when user selected new page in pagination bar
     */
    function onNotActivatedUsersPageChanged(event) {
        notActivatedUsersCurrentPage = event.detail.newPageIndex;
        notActivatedUsersOffset = notActivatedUsersCurrentPage * notActivatedUsersPageSize;
    }

    let activatedUsersCurrentPage = 0;
    const activatedUsersPageSize = 10;
    let activatedUsersPageCount;
    let activatedUsersOffset = activatedUsersCurrentPage * activatedUsersPageSize;

    /**
     * Called when user selected new page in pagination bar
     */
    function onActivatedUsersPageChanged(event) {
        activatedUsersCurrentPage = event.detail.newPageIndex;
        activatedUsersOffset = activatedUsersCurrentPage * activatedUsersPageSize;
    }
</script>

<AuthorizeByRoles allowedRoles={[Roles.ADMIN, Roles.TREASURER]}>
    <ErrorModal error={requestError} />

    <div class="mb-4">
        <TextField
            bind:this={searchTermElement}
            label="Suchen (nach Benutzername oder Mitgliedsnummer):"
            placeholder="Suchen"
            on:input={onSearchTermChange}
        />
    </div>

    {#if isLoading}
        <Loader isLoading={isLoading} />
    {:else if !searchTerm}
        <!-- If no search term is given, display the users grouped by their activation status -->
        {#if notActivatedUsers.length > 0}
            <div class="mb-5">
                <div>Nicht aktivierte Benutzer:</div>
                {#each notActivatedUsers.slice(notActivatedUsersOffset, notActivatedUsersOffset + notActivatedUsersPageSize) as user}
                    <UserListItem user={user} on:click={() => goto(`/users/${user.id}`)} />
                {/each}
                <Pagination
                    currentPageIndex={notActivatedUsersCurrentPage}
                    pageCount={notActivatedUsersPageCount}
                    on:update={onNotActivatedUsersPageChanged}
                />
            </div>
        {/if}

        <div>Aktivierte Benutzer:</div>
        {#each activatedUsers.slice(activatedUsersOffset, activatedUsersOffset + activatedUsersPageSize) as user}
            <UserListItem user={user} on:click={() => goto(`/users/${user.id}`)} />
        {:else}
            <NoData text="Es wurden keine Benutzer gefunden!" />
        {/each}
        <Pagination
            currentPageIndex={activatedUsersCurrentPage}
            pageCount={activatedUsersPageCount}
            on:update={onActivatedUsersPageChanged}
        />
    {:else}
        <!-- Display all users that match the search term -->
        {#each allUsers as user}
            {#if user.username.toLocaleUpperCase().includes(searchTerm.toLocaleUpperCase()) || user.memberId
                    .toString()
                    .includes(searchTerm)}
                <UserListItem user={user} on:click={() => goto(`/users/${user.id}`)} />
            {/if}
        {/each}
    {/if}

    <div class="container has-text-centered mt-6">
        <Button goHome={true} size="full-width" />
    </div>
</AuthorizeByRoles>
