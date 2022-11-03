<script>
    import { createEventDispatcher } from 'svelte';
    import TextField from '../common/TextField.svelte';
    import ErrorModal from '../common/ErrorModal.svelte';
    import Button from '../common/Button.svelte';
    import User from '../../scripts/user/User';
    import AuthorizeByRoles from '../common/AuthorizeByRoles.svelte';
    import { Roles } from '../../scripts/roles/Roles';
    import { userDetails } from '../../stores/userDetails';
    import { toastText } from '../../stores/toast';

    export let user;
    export let password;
    export let otherData;

    // fields for memberid handling
    let memberIdInput;
    let memberIdError = false;
    const memberIdMinimumLength = 4;

    // fields for password handling
    let passwordInput;
    let passwordError = false;
    const passwordMinimumLength = 8;

    // fields for repeat password handling
    let repeatPasswordInput;
    let repeatPasswordError = false;

    // fields for email handling
    let emailInput;
    let emailError = false;

    let allowUpdate = false;

    let requestError;

    const eventDispatcher = createEventDispatcher();

    // check if a given input field has the specified length
    function hasMinimumLength(input, minimumLength) {
        const value = input.getValue();
        return !value || value.length >= minimumLength;
    }

    // check if the memberid is valid
    function checkMemberId() {
        if (hasMinimumLength(memberIdInput, memberIdMinimumLength)) {
            memberIdError = false;
            allowUpdate = true;
        } else {
            memberIdError = true;
            allowUpdate = false;
        }
    }

    // check if the password is valid
    function checkPassword() {
        passwordError = !hasMinimumLength(passwordInput, passwordMinimumLength);

        if (repeatPasswordInput.getValue()) {
            // only check if the passwords are equal if the second password already has an value
            checkRepeatPassword();
        }
    }

    // check if both passwords are equal
    function checkRepeatPassword() {
        if (passwordInput.getValue() === repeatPasswordInput.getValue()) {
            repeatPasswordError = false;
            allowUpdate = !repeatPasswordError && !passwordError;
        } else {
            repeatPasswordError = true;
            allowUpdate = false;
        }
    }

    // check if the email is valid
    function checkEmail() {
        const email = emailInput.getValue();

        if (!email) {
            emailError = false;
            allowUpdate = true;
            return;
        }

        // regex for email validation
        // eslint-disable-next-line max-len
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        emailError = !re.test(String(email).toLowerCase());
        allowUpdate = !emailError;
    }

    async function updateUserData() {
        try {
            // patch the user date
            await User.update(
                user.id,
                memberIdInput ? memberIdInput.getValue() : undefined,
                passwordInput && passwordInput.getValue() !== '' ? passwordInput.getValue() : undefined,
                emailInput ? emailInput.getValue() : undefined
            );

            // if its our user, update the user details
            if (user.id === $userDetails.id) {
                await userDetails.forceUpdate();
            }

            // call the update event from the upper component
            eventDispatcher('update');

            // display the success message
            // eslint-disable-next-line no-unused-vars
            $toastText = 'Benutzerdaten erfolgreich aktualisiert';

            // clear the password fields
            if (passwordInput) passwordInput.clear();
            if (repeatPasswordInput) repeatPasswordInput.clear();
        } catch (error) {
            requestError = error;
        }
    }
</script>

<ErrorModal error={requestError} />

{#if user}
    {#if otherData}
        <AuthorizeByRoles allowedRoles={[Roles.ADMIN]} displayPermissionNotAllowed={false}>
            <div class="pt-4">
                <TextField
                    bind:this={memberIdInput}
                    type="text"
                    label="Mitgliedsnummer"
                    placeholder={user.memberId}
                    value={user.memberId}
                    on:input={checkMemberId}
                    isInErrorState={memberIdError}
                />
            </div>
        </AuthorizeByRoles>

        <div class="pt-4">
            <TextField
                bind:this={emailInput}
                type="email"
                label="E-Mail"
                placeholder={user.email !== undefined ? user.email : ''}
                value={user.email !== undefined ? user.email : ''}
                on:input={checkEmail}
                isInErrorState={emailError}
            />
        </div>
    {/if}
    {#if password}
        <div class="pt-4">
            <TextField
                bind:this={passwordInput}
                type="password"
                label="Passwort"
                placeholder="Passwort"
                on:input={checkPassword}
                isInErrorState={passwordError}
            />
        </div>
        <div class="pt-4">
            <TextField
                bind:this={repeatPasswordInput}
                type="password"
                label="Passwort wiederholen"
                placeholder="Passwort wiederholen"
                on:input={checkRepeatPassword}
                isInErrorState={repeatPasswordError}
            />
            {#if repeatPasswordError}<span class="has-text-danger">Passwörter sind nicht identisch!</span>{/if}
        </div>
    {/if}
    <div class="container has-text-centered mt-6">
        <Button
            disabled={!allowUpdate}
            text="Benutzerdaten aktualisieren"
            class="is-primary mb-3"
            size="full-width"
            on:click={updateUserData}
        />
    </div>
{/if}
