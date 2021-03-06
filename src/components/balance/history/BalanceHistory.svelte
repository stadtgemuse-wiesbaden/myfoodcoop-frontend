<script>
    import { DateTime } from 'luxon';
    import { goto } from '@sapper/app';
    import Balance from '../../../scripts/balance/Balance';
    import ErrorModal from '../../common/ErrorModal.svelte';
    import Pagination from '../../pagination/Pagination.svelte';
    import ListItem from '../../common/ListItem.svelte';
    import { moneyStyler } from '../../../scripts/common/Helper';
    import CenteredLoader from '../../common/CenteredLoader.svelte';
    import MobileReloadButton from '../../common/MobileReloadButton.svelte';
    import Button from '../../common/Button.svelte';
    import NoData from '../../common/NoData.svelte';

    /**
     * Unique of id of the user
     */
    export let userId;

    let error;

    let currentPage = 0;
    const pageSize = 10;
    let pageCount;

    let balanceHistoryItems = [];
    let isLoading = false;

    const periods = calcPeriods();
    let currentPeriod = periods.today;

    let { fromDate, toDate } = { ...currentPeriod };

    updateBalanceHistoryItems(fromDate, toDate);

    function calcPeriods() {
        const today = DateTime.local();

        const yesterday = today.minus({ days: 1 });

        const lastWeekSunday = today.minus({ days: today.weekday });
        const lastWeekMonday = lastWeekSunday.minus({ days: 6 });

        const lastMonthFirstDay = DateTime.local(today.year, today.month, 1).minus({ month: 1 });
        const lastMonthLastDay = lastMonthFirstDay.plus({ month: 1, days: -1 });

        return {
            today: {
                text: 'Heute',
                fromDate: today,
                toDate: today,
            },
            yesterday: {
                text: 'Gestern',
                fromDate: yesterday,
                toDate: yesterday,
            },
            lastWeek: {
                text: 'Letzte Woche',
                fromDate: lastWeekMonday,
                toDate: lastWeekSunday,
            },
            lastMonth: {
                text: 'Letzten Monat',
                fromDate: lastMonthFirstDay,
                toDate: lastMonthLastDay,
            },
        };
    }

    /**
     * Update the pagination details provided by the pagination component
     */
    function onPageChanged(event) {
        currentPage = event.detail.newPageIndex;

        updateBalanceHistoryItems(fromDate, toDate);
    }

    /**
     * Set a new period and load the respective items
     */
    function setPeriod(newPeriod) {
        currentPeriod = newPeriod;

        fromDate = currentPeriod.fromDate;
        toDate = currentPeriod.toDate;

        updateBalanceHistoryItems(fromDate, toDate);
    }

    /**
     * Show the balance history items for an arbitrary day range [fromDate, toDate]
     */
    async function updateBalanceHistoryItems(newFromDate, newToDate) {
        try {
            // Start loading indicator
            isLoading = true;

            const fromDateStr = newFromDate.toFormat('yyyy-MM-dd');
            const toDateStr = newToDate.toFormat('yyyy-MM-dd');

            // Calc offset and limit pagination params from current page index and page size
            const offset = currentPage * pageSize;
            const limit = pageSize;

            // Query backend for balance history items within currently selected date range
            const response = await Balance.getHistory(userId, fromDateStr, toDateStr, offset, limit);

            // No error thrown -> Hide error message
            error = null;

            balanceHistoryItems = response.balanceHistoryItems;

            // Calc and save total page count
            const totalItems = response.pagination.total;
            pageCount = Math.ceil(totalItems / pageSize);

            // Keep currently selected page, except when new data result in less pages, then switch to last page
            currentPage = Math.min(currentPage, pageCount);
        } catch (err) {
            // Show error message
            error = err;
        } finally {
            // Stop loading indicator
            isLoading = false;
        }
    }

    /**
     * Get a balance change type's sign for display in the UI.
     * For example, '-' for a withdraw from the user's balance.
     */
    function getSign(balanceChangeType) {
        if (balanceChangeType === 'TOPUP') {
            return '+';
        }

        if (balanceChangeType === 'SET') {
            return '';
        }

        return '-';
    }

    /**
     * Handle date input change -> Save date and load data if both dates (fromDate and toDate) are set
     *
     * @param changedDate Which date was changed, either 'fromDate' or 'toDate'
     */
    async function onDateChanged(changedDate, event) {
        const date = DateTime.fromJSDate(new Date(event.target.value));

        if (changedDate === 'fromDate') {
            fromDate = date;
        } else {
            toDate = date;
        }

        // Unset period badge when chosing arbitrary date range
        currentPeriod = null;

        // Not both dates set -> Do nothing
        if (!fromDate || !toDate) {
            return;
        }

        updateBalanceHistoryItems(fromDate, toDate);
    }

    async function handleListItemClick(balanceHistoryItem) {
        if (balanceHistoryItem.balanceChangeType !== 'PURCHASE') {
            return;
        }

        await goto(`history/${balanceHistoryItem.purchase.id}`);
    }
</script>

{#if error}
    <ErrorModal error={error} />
{/if}

<!-- Reload Button in the upper right -->
<MobileReloadButton on:click={() => updateBalanceHistoryItems(fromDate, toDate)} />

<!-- Period buttons -->
<div class="is-flex is-flex-wrap-wrap is-justify-content-center">
    {#each Object.values(periods) as period}
        <Button
            class="my-2 mx-2 is-rounded {period === currentPeriod ? 'is-dark' : ''}"
            text={period.text}
            on:click={() => setPeriod(period)}
        />
    {/each}
</div>

<!-- Date pickers -->
<div class="columns py-4">
    <div class="column">
        <input
            type="date"
            class="input"
            value={fromDate.toFormat('yyyy-MM-dd')}
            max={DateTime.local().toFormat('yyyy-MM-dd')}
            on:change={(event) => onDateChanged('fromDate', event)}
        />
    </div>
    <div class="column">
        <input
            type="date"
            class="input"
            value={toDate.toFormat('yyyy-MM-dd')}
            min={fromDate.toFormat('yyyy-MM-dd')}
            max={DateTime.local().toFormat('yyyy-MM-dd')}
            on:change={(event) => onDateChanged('toDate', event)}
        />
    </div>
</div>

{#if balanceHistoryItems && balanceHistoryItems.length > 0}
    <CenteredLoader isLoading={isLoading} displayBackgroundWhileLoading={balanceHistoryItems.length > 0}>
        {#each balanceHistoryItems as balanceHistoryItem}
            <ListItem
                size="small"
                isClickable={balanceHistoryItem.balanceChangeType === 'PURCHASE'}
                on:click={() => handleListItemClick(balanceHistoryItem)}
            >
                <div
                    class="columns is-mobile"
                    class:has-text-success={balanceHistoryItem.balanceChangeType === 'TOPUP'}
                    class:has-text-danger={balanceHistoryItem.balanceChangeType === 'PURCHASE'}
                >
                    <div class="column has-text-left">
                        <span>{DateTime.fromISO(balanceHistoryItem.createdOn).toFormat('dd.MM.yyyy HH:mm')}</span>
                    </div>
                    <div class="column has-text-right">
                        <span>
                            {getSign(balanceHistoryItem.balanceChangeType)}
                            {moneyStyler(balanceHistoryItem.amount)}
                            €
                        </span>
                    </div>
                </div>
            </ListItem>
        {/each}
    </CenteredLoader>

    <Pagination currentPageIndex={currentPage} pageCount={pageCount} on:update={onPageChanged} />
{:else}
    <NoData />
{/if}
