<script>
    import { goto } from '@sapper/app';
    import { mdiPlusBox } from '@mdi/js';
    import StockList from '../../components/stock/StockList.svelte';
    import { title, navBalance } from '../../stores/page';
    import Button from '../../components/common/Button.svelte';
    import {
        areStockItemsUpdating,
        inStockItems,
        orderedItems,
        outOfStockItems,
        spoilsSoonItems,
        stockItems,
    } from '../../stores/stock';
    import AuthorizeByRoles, { Roles } from '../../components/common/AuthorizeByRoles.svelte';
    import { StockStatus, getLocalizedStockStatus } from '../../scripts/stock/StockStatus';
    import MobileReloadButton from '../../components/common/MobileReloadButton.svelte';
    import Loader from '../../components/common/Loader.svelte';

    // eslint-disable-next-line prefer-const, no-unused-vars
    $title = 'Bestand';
    // eslint-disable-next-line prefer-const, no-unused-vars
    $navBalance = 'hidden';

    function onSelectItem(event) {
        goto(`/stock/item/${event.detail.id}`);
    }

    function updateStock() {
        stockItems.forceUpdate();
    }
</script>

<AuthorizeByRoles allowedRoles={[Roles.MEMBER]}>
    <MobileReloadButton on:click={updateStock} />

    {#if $areStockItemsUpdating}
        <Loader />
    {:else}
        <AuthorizeByRoles allowedRoles={[Roles.ORDERER]} displayPermissionNotAllowed={false}>
            <div class="has-text-centered">
                <Button
                    text="Bestand hinzufügen"
                    class="button is-primary mb-3 mt-3"
                    href="/stock/item/new"
                    size="full-width"
                    icon={mdiPlusBox}
                />
            </div>
            <hr />
        </AuthorizeByRoles>

        {#if $spoilsSoonItems && $spoilsSoonItems.length > 0}
            <!-- Items spoiling soon -->
            <div>{getLocalizedStockStatus(StockStatus.SPOILSSOON)}</div>
            <StockList
                stockItems={$spoilsSoonItems}
                allowDetails={true}
                on:details={onSelectItem}
                on:select={onSelectItem}
                isClickable={true}
                highlight
                highlightBackground="bg-highlight-spoiled-soon"
            />

            <hr />
        {/if}

        {#if $inStockItems && $inStockItems.length > 0}
            <!-- items that are in stock -->
            <div>{getLocalizedStockStatus(StockStatus.INSTOCK)}</div>
            <StockList
                stockItems={$inStockItems}
                allowDetails={true}
                on:details={onSelectItem}
                on:select={onSelectItem}
                isClickable={true}
                highlightBackground="bg-highlight-in-stock"
            />
            <hr />
        {/if}

        {#if $orderedItems && $orderedItems.length > 0}
            <!-- items that are ordered -->
            <div>{getLocalizedStockStatus(StockStatus.ORDERED)}</div>
            <StockList
                stockItems={$orderedItems}
                allowDetails={true}
                on:details={onSelectItem}
                on:select={onSelectItem}
                isClickable={true}
                highlightBackground="bg-highlight-ordered"
            />
            <hr />
        {/if}

        <AuthorizeByRoles allowedRoles={[Roles.ORDERER]} displayPermissionNotAllowed={false}>
            {#if $outOfStockItems && $outOfStockItems.length > 0}
                <!-- items that are out of stock -->
                <div>{getLocalizedStockStatus(StockStatus.OUTOFSTOCK)}</div>
                <StockList
                    stockItems={$outOfStockItems}
                    allowDetails={true}
                    on:details={onSelectItem}
                    on:select={onSelectItem}
                    isClickable={true}
                    highlightBackground="bg-highlight-out-of-stock"
                />
                <hr />
            {/if}
        </AuthorizeByRoles>
    {/if}

    <div class="has-text-centered">
        <Button goHome={true} size="full-width" />
    </div>
</AuthorizeByRoles>
