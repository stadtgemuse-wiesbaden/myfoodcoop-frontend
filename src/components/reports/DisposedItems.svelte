<script>
    import { createEventDispatcher } from 'svelte';
    import { moneyStyler } from '../../scripts/common/Helper';
    import { UnitType } from '../../scripts/stock/UnitType';

    /**
     * A list of items disposed in a time window (disposed-item-list response)
     */
    export let disposedItems = [];
    const selectEvent = createEventDispatcher();
</script>

{#if disposedItems !== undefined}
    <div class="columns is-mobile">
        <div class="column has-text-weight-bold has-text-left">Artikelname</div>
        <div class="column has-text-weight-bold has-text-centered">entsorgte Menge</div>
        <div class="column has-text-weight-bold has-text-centered is-hidden-touch">MwSt. Satz</div>
        <div class="column has-text-weight-bold has-text-centered is-hidden-touch">Steuern</div>
        <div class="column has-text-weight-bold has-text-right">Brutto</div>
    </div>
    {#each disposedItems as item}
        <div class="columns is-mobile is-clickable" on:click={selectEvent('select', { id: item.stockId })}>
            <div class="column break-all has-text-left">{item.name}</div>
            <div class="column has-text-centered">
                {item.amount}
                {item.unitType === UnitType.PIECE ? 'Stück' : 'kg'}
            </div>
            <div class="column has-text-centered is-hidden-touch">{moneyStyler(item.vat * 100)}%</div>
            <div class="column has-text-centered is-hidden-touch">{moneyStyler(item.totalVat)} €</div>
            <div class="column has-text-right">{moneyStyler(item.grossAmount)} €</div>
        </div>
    {/each}
{/if}
