<script>
    import { DateTime } from 'luxon';
    import { goto } from '@sapper/app';
    import { mdiDelete, mdiPencil, mdiDeleteVariant, mdiLeaf, mdiNewBox } from '@mdi/js';
    import { UnitType } from '../../scripts/stock/UnitType';
    import Stock from '../../scripts/stock/Stock';
    import Modal from '../common/Modal.svelte';
    import ErrorModal from '../common/ErrorModal.svelte';
    import AuthorizeByRoles, { Roles } from '../common/AuthorizeByRoles.svelte';
    import Icon from '../common/Icon.svelte';
    import { stockItems } from '../../stores/stock';
    import { getLocalizedOriginCategory } from '../../scripts/OriginCategory';
    import { moneyStyler, quantityStyler } from '../../scripts/common/Helper';
    import { CertificateLogos } from '../../scripts/stock/CertificateLogos';
    import Button from '../common/Button.svelte';
    import { getLocalizedStockStatus } from '../../scripts/stock/StockStatus';
    import { getTaxPriceFromItem } from '../../scripts/stock/StockItem';
    import { toastText } from '../../stores/toast';

    /**
     * The stock item
     */
    export let item;
    /**
     * Displays buttons to edit or reorder the stock item.
     * Default: false
     */
    export let showButtons = false;

    let requestError;

    let modalIsOpen = false;
    let stockItemIdToRemove;

    function confirmRemoveItem(itemID) {
        modalIsOpen = true;
        stockItemIdToRemove = itemID;
    }

    async function removeItem() {
        try {
            modalIsOpen = false;

            await Stock.removeItem(stockItemIdToRemove);

            // as one item was removed, reload the stock list
            stockItems.forceUpdate();

            // eslint-disable-next-line no-unused-vars
            $toastText = 'Artikel erfolgreich gelöscht';

            goto('/stock/');
        } catch (error) {
            requestError = error;
        }
    }

    function closeModal() {
        modalIsOpen = false;
    }
</script>

<style>
    img.cert-img {
        max-height: 65px;
        float: right;
    }
    .green-line {
        font-size: 17px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
</style>

<ErrorModal error={requestError} />

<Modal title="Artikel löschen?" bind:open={modalIsOpen}>
    <div slot="body"><span>Willst Du den Artikel wirklich unwiderruflich löschen?</span></div>
    <div slot="footer">
        <button class="button is-danger" on:click={removeItem}>Löschen</button>
        <button class="button is-primary" on:click={closeModal}>Abbrechen</button>
    </div>
</Modal>

{#if item}
    <div class="columns">
        <div class="column">
            <div class=" is-size-3 has-text-weight-bold">{item.name}</div>
        </div>
        <!-- Show column only if array contains a certificate from CertificateLogos -->
        {#if item.certificates.some((r) => CertificateLogos.map((l) => l.name).includes(r))}
            <div class="column" style="min-height:75px;">
                {#each CertificateLogos as logo}
                    {#if item.certificates.includes(logo.name)}
                        <img class="cert-img" src={logo.image} alt="{logo.name}_Logo" />
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
    {#if item.sustainablyProduced}
        <div class="green-line has-text-right">
            <Icon icon={mdiLeaf} appbar={true} green={true} />
            Dieser Artikel wurde nachhaltig produziert
        </div>
    {/if}
    <hr />
    {#if item.isDeleted}
        <article class="message is-danger">
            <div class="message-body">Artikel wurde gelöscht</div>
        </article>
    {/if}
    <div class="columns is-mobile">
        <div class="column">Artikel Status</div>
        <div class="column has-text-right">{getLocalizedStockStatus(item.stockStatus)}</div>
    </div>

    <div class="columns is-mobile">
        <div class="column">Warenpreis</div>
        <div class="column has-text-right">
            {#if item.unitType === UnitType.PIECE}
                <span>{moneyStyler(item.pricePerUnit)} € / Stück</span>
            {:else}<span>{moneyStyler(item.pricePerUnit)} € / kg</span>{/if}
        </div>
    </div>
    <div class="columns is-mobile">
        <div class="column">Steuersatz</div>
        <div class="column has-text-right">
            {Math.floor(item.vat * 100)}
            % ({moneyStyler(getTaxPriceFromItem(item))}
            €)
        </div>
    </div>
    <div class="columns is-mobile">
        <div class="column">Menge im Bestand</div>
        {#if item.unitType === UnitType.PIECE}
            <div class="column has-text-right">{item.quantity} Stück</div>
        {:else}
            <div class="column has-text-right">{quantityStyler(item.quantity)} kg</div>
        {/if}
    </div>
    <hr />
    <span>Information:</span>
    <div class="box">
        <div class="columns is-mobile">
            <div class="column">Herkunftskategorie:</div>
            <div class="column">{getLocalizedOriginCategory(item.originCategory)}</div>
        </div>
        {#if item.certificates !== []}
            <div class="columns is-mobile">
                <div class="column">Zertifikate:</div>
                <div class="column">{item.certificates.join(' | ')}</div>
            </div>
        {/if}
        <div class="columns is-mobile">
            <div class="column">Erzeuger:</div>
            <div class="column">{item.producer}</div>
        </div>
        <div class="columns is-mobile">
            <div class="column">Lieferant:</div>
            <div class="column">{item.supplier}</div>
        </div>
        <div class="columns is-mobile">
            <div class="column">Lieferdatum:</div>
            <div class="column">
                {item.orderDate
                    ? DateTime.fromJSDate(new Date(item.orderDate)).toFormat('dd.MM.yyyy')
                    : 'Nicht gesetzt'}
            </div>
        </div>
        <div class="columns is-mobile">
            <div class="column">Bestelldatum:</div>
            <div class="column">
                {item.deliveryDate
                    ? DateTime.fromJSDate(new Date(item.deliveryDate)).toFormat('dd.MM.yyyy')
                    : 'Nicht gesetzt'}
            </div>
        </div>
    </div>
    {#if item.description}
        <span>Beschreibung:</span>
        <div class="box"><span>{item.description}</span></div>
    {/if}
    {#if showButtons && !item.isDeleted}
        <hr />
        <div class="container has-text-centered">
            <AuthorizeByRoles allowedRoles={[Roles.ORDERER]} displayPermissionNotAllowed={false}>
                <Button
                    text="Artikel neu bestellen"
                    size="full-width"
                    class="is-warning mb-3"
                    on:click={() => goto(`/stock/item/new?itemId=${item.id}`)}
                    icon={mdiNewBox}
                />
                <Button
                    text="Artikel bearbeiten"
                    size="full-width"
                    class="is-primary mb-3"
                    on:click={() => goto(`/stock/item/${item.id}/edit`)}
                    icon={mdiPencil}
                />
                <Button
                    text="Artikel löschen"
                    size="full-width"
                    class="is-danger"
                    on:click={() => confirmRemoveItem(item.id)}
                    icon={mdiDelete}
                />
            </AuthorizeByRoles>
            <Button
                text="Verdorbene Ware entsorgen"
                size="full-width"
                class="is-danger mt-3"
                on:click={() => goto(`/stock/item/${item.id}/dispose`)}
                icon={mdiDeleteVariant}
            />
        </div>
    {/if}
{/if}
