<script>
    import { ErrorTranslation } from '../../scripts/api/CustomError';
    /**
     * Error to be displayed in a modal
     */
    export let error;

    let isActive = false;
    const errorText = ErrorTranslation;

    // Necessary in order to display a more detailed error in dev mode
    const isInDevMode = process.env.NODE_ENV === 'development';

    $: {
        // Redisplay the error form, if the error changes and is not undefined
        if (error !== undefined) {
            isActive = true;
        }
    }

    function closeModal() {
        isActive = false;
    }
</script>

<div class:is-active={isActive} class="modal has-text-left">
    <!-- This is the light grey background -->
    <div class="modal-background" on:click={closeModal} />
    <div class="modal-card">
        <!-- The header of the card -->
        <header class="modal-card-head">
            <p class="modal-card-title">Ups, ein Fehler ist aufgetreten!</p>
            <button class="delete" aria-label="close" on:click={closeModal} />
        </header>

        <!-- Main Component, display the error here -->
        <section class="modal-card-body">
            {#if error && error.errorCode && error.message}
                <!-- Show the error code for everyone -->
                <p>Fehler: {errorText(error.errorCode)}</p>

                {#if isInDevMode}
                    <!-- If we are in dev mode, display more details for the developer -->
                    <p>Details für Entwickler:</p>
                    <div class="is-size-7">
                        <p>Fehlernachricht: {error.message}</p>
                        <p>Fehlerdetails: {JSON.stringify(error.details)}</p>
                    </div>
                {:else}
                    <!-- Show a generic error in production -->
                    <p>Bitte kontaktieren Sie mit dem Fehlercode {error.errorCode} den Betreiber der Seite</p>
                {/if}
            {:else if isInDevMode && error !== undefined}
                <!-- Show the error, if we are in dev mode and the error is not from our api -->
                <span>{error}</span>
            {:else}
                <!-- Show generic error -->
                <span>Es ist ein unbestimmter Fehler aufgetreten!</span>
            {/if}
        </section>

        <!-- Footer with a close button -->
        <footer class="modal-card-foot"><button class="button" on:click={closeModal}>Schließen</button></footer>
    </div>
</div>
