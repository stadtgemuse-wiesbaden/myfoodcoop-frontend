<script>
    import { mdiEye, mdiLeaf } from '@mdi/js';
    import { createEventDispatcher } from 'svelte';
    import { moneyStyler, quantityStyler, stopPropagation } from '../../scripts/common/Helper';
    import { UnitType } from '../../scripts/stock/UnitType';
    import Icon from '../common/Icon.svelte';
    import { CertificateLogos } from '../../scripts/stock/CertificateLogos';
    import ListItem from '../common/ListItem.svelte';
    import Loader from '../common/Loader.svelte';
    import NoData from '../common/NoData.svelte';
    import Pagination from '../pagination/Pagination.svelte';

    /**
     * An Array of StockItems to be displayed
     */
    export let stockItems;

    /**
     * Defines if the cursor should switch to pointer
     * Default: false
     */
    export let isClickable = false;

    /**
     * Displays a button, which allows to delete items
     */
    export let allowDetails = false;

    /**
     * Display a loading spinner instead of the list
     */
    export let isLoading = false;

    export let highlightBackground = '';

    /**
     * Defines if the items should be highlighted
     * Default: false
     */
    export let highlight = false;

    const selectEvent = createEventDispatcher();

    function selectItem(event, itemId) {
        stopPropagation(event);
        selectEvent('select', {
            id: itemId,
        });
    }

    function selectItemByDetail(event, itemdID) {
        stopPropagation(event);
        selectEvent('details', {
            id: itemdID,
        });
    }

    // Pagination
    //
    // Performing client-side pagination (instead of server-side) because filtering items
    // requires more items than contained within a single page delivered by the backend.
    // Otherwise, pages would contain few or no items at all after filtering. Also,
    // calculating the total number of pages after filting requires knowledge about all items.

    let currentPage = 0;
    const pageSize = 5;
    let pageCount;
    let offset;

    // Update page count when item list changes
    // Also, currentPage might be forced to last page (but at least page 0) if item list shrinks
    $: {
        stockItems = stockItems;
        pageCount = Math.ceil(stockItems.length / pageSize);
        currentPage = Math.min(currentPage, Math.max(pageCount - 1, 0));
        offset = currentPage * pageSize;
    }

    /**
     * Called when user selected new page in pagination bar
     */
    function onPageChanged(event) {
        currentPage = event.detail.newPageIndex;
        offset = currentPage * pageSize;
    }
</script>

<style>
    .has-text-right span {
        float: right;
    }
    img.cert-img {
        max-height: 25px;
        float: right;
    }
    .logo-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
    }
</style>

{#if isLoading}
    <Loader bind:isLoading />
{:else if stockItems && stockItems.length > 0}
    {#each stockItems.slice(offset, offset + pageSize) as item}
        <ListItem
            isClickable={isClickable}
            highlight={highlight}
            on:click={(event) => selectItem(event, item.id)}
            highlightBackground={highlightBackground}
        >
            <!--First column with item name, buttons, stock quantity and price -->
            <div class="columns m-0 is-mobile">
                {#if allowDetails}
                    <div class="column is-narrow has-text-left">
                        <button class="button is-white" on:click={(event) => selectItemByDetail(event, item.id)}>
                            <span class="icon">
                                <Icon icon={mdiEye} />
                            </span>
                        </button>
                    </div>
                {/if}
                <div class="column has-text-left ">
                    <span class="has-text-weight-bold break-all">{item.name}</span><br />
                    {#if item.unitType === UnitType.PIECE}
                        <span class="is-size-7 is-hidden-desktop">{moneyStyler(item.pricePerUnit)} € / Stück</span>
                    {:else}<span class="is-size-7 is-hidden-desktop">{moneyStyler(item.pricePerUnit)} € / kg</span>{/if}
                </div>
                <div class="column is-one-quarter has-text-right">
                    {#if item.unitType === UnitType.PIECE}
                        <span>{item.quantity} Stück vorhanden</span>
                    {:else}<span>{quantityStyler(item.quantity)} kg vorhanden</span>{/if}
                </div>
                <div class="column has-text-right is-hidden-touch">
                    {#if item.unitType === UnitType.PIECE}
                        <span>{moneyStyler(item.pricePerUnit)} € / Stück</span>
                    {:else}<span>{moneyStyler(item.pricePerUnit)} € / kg</span>{/if}
                </div>
            </div>
            <div class="logo-container">
                {#if item.sustainablyProduced}
                    <div class="has-text-right">
                        <Icon icon={mdiLeaf} small={true} green={true} />
                    </div>
                {/if}
                <!-- Show column only if array contains a certificate from CertificateLogos -->
                {#if item.certificates.some((r) => CertificateLogos.map((l) => l.name).includes(r))}
                    {#each CertificateLogos as logo}
                        {#if item.certificates.includes(logo.name)}
                            <img class="cert-img" src={logo.imageMini} alt="{logo.name}_Logo" />
                        {/if}
                    {/each}
                {/if}
            </div>
        </ListItem>
    {/each}

    <Pagination currentPageIndex={currentPage} pageCount={pageCount} on:update={onPageChanged} />
{:else}
    <NoData text="Der Bestand ist leer" />
{/if}
