<script>
    import { goto } from '@sapper/app';
    import TextField from '../../components/common/TextField.svelte';
    import Button from '../../components/common/Button.svelte';
    import User from '../../scripts/user/User';
    import ErrorModal from '../../components/common/ErrorModal.svelte';
    import { title, navBalance } from '../../stores/page';
    import { ORGANIZATION_NAME } from '../../scripts/Config';

    // eslint-disable-next-line prefer-const, no-unused-vars
    $title = 'Registrierung';
    // eslint-disable-next-line prefer-const, no-unused-vars
    $navBalance = 'hidden';

    // fields for username handling
    let userNameInput;
    let userNameError = false;
    const userNameMinimumLength = 4;

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

    // boolean to indicate if the registration button is enabled or disabled
    let allowRegistration = false;

    // boolean to indicate if the registration is currently processing
    let isRegistrationProcessing = false;

    // indicate if an error occured
    let requestError;

    // check if a given input field has the specified length
    function hasMinimumLength(input, minimumLength) {
        const value = input.getValue();
        return !value || value.length >= minimumLength;
    }

    // check if the username is valid
    function checkUserName() {
        userNameError = !hasMinimumLength(userNameInput, userNameMinimumLength);

        checkAllowRegistration();
    }

    // check if the memberid is valid
    function checkMemberId() {
        memberIdError = !hasMinimumLength(memberIdInput, memberIdMinimumLength);

        checkAllowRegistration();
    }

    // check if the password is valid
    function checkPassword() {
        passwordError = !hasMinimumLength(passwordInput, passwordMinimumLength);

        if (repeatPasswordInput.getValue()) {
            // only check if the passwords are equal if the second password already has an value
            checkRepeatPassword();
        }
        checkAllowRegistration();
    }

    // check if both passwords are equal
    function checkRepeatPassword() {
        repeatPasswordError = passwordInput.getValue() !== repeatPasswordInput.getValue();

        checkAllowRegistration();
    }

    // check if the email is valid
    function checkEmail() {
        const email = emailInput.getValue();

        if (!email) {
            emailError = false;
            return;
        }

        // regex for email validation
        // eslint-disable-next-line max-len
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        emailError = !re.test(String(email).toLowerCase());

        checkAllowRegistration();
    }

    // check if all requirements for registration are met
    function checkAllowRegistration() {
        allowRegistration =
            userNameInput.getValue() &&
            !userNameError &&
            memberIdInput.getValue() &&
            !memberIdError &&
            passwordInput.getValue() &&
            !passwordError &&
            repeatPasswordInput.getValue() &&
            !repeatPasswordError &&
            !emailError; // we dont check the value of email here as it is an optional field
    }

    // do the registration and log the user in and handle any potential errors
    async function processRegistration() {
        isRegistrationProcessing = true;
        try {
            // register the user
            await User.register(
                userNameInput.getValue().trim(),
                memberIdInput.getValue(),
                passwordInput.getValue(),
                emailInput.getValue()
            );
            goto('/profile/login?register=true');
        } catch (error) {
            requestError = error;
        } finally {
            isRegistrationProcessing = false;
        }
    }
</script>

<h1 class="title has-text-centered">Willkommen zur {ORGANIZATION_NAME} Einkaufsapp</h1>
<p>Damit wir dich während des Einkaufen identifizieren können, musst du dir zunächst ein Benutzerkonto anlegen:</p>
<br />

{#if requestError && requestError.errorCode === 400014}
    <article class="message is-danger">
        <div class="message-body">Email wird bereits verwendet!</div>
    </article>
{:else if requestError && requestError.errorCode === 400015}
    <article class="message is-danger">
        <div class="message-body">Benutzername wird bereits verwendet!</div>
    </article>
{:else if requestError && requestError.errorCode === 400016}
    <article class="message is-danger">
        <div class="message-body">Mitgliedsnummer wird bereits verwendet!</div>
    </article>
{:else}
    <!-- Display Error popup if an unexpected error occured. -->
    <ErrorModal error={requestError} />
{/if}

<!-- username textfield -->
<TextField
    bind:this={userNameInput}
    type="text"
    label="Benutzername"
    on:input={checkUserName}
    isInErrorState={userNameError}
/>
{#if userNameError}
    <span class="has-text-danger">Benutzername muss mindestens {userNameMinimumLength} Zeichen lang sein!</span>
{/if}

<br />

<!-- memberid inputfield -->
<TextField
    bind:this={memberIdInput}
    type="text"
    label="Mitgliedsnummer"
    on:input={checkMemberId}
    isInErrorState={memberIdError}
/>
{#if memberIdError}
    <span class="has-text-danger">Mitgliedsnummer muss mindestens {userNameMinimumLength} Zeichen lang sein!</span>
{/if}

<br />

<!-- Email textfield -->
<TextField
    bind:this={emailInput}
    type="email"
    label="Email (optional)"
    on:input={checkEmail}
    isInErrorState={emailError}
/>
{#if emailError}<span class="has-text-danger">Email ist nicht valide!</span>{/if}

<br />

<!-- password field -->
<TextField
    bind:this={passwordInput}
    type="password"
    label="Passwort"
    on:input={checkPassword}
    isInErrorState={passwordError}
/>
{#if passwordError}
    <span class="has-text-danger">Passwort muss mindestens {passwordMinimumLength} Zeichen lang sein!</span>
{/if}

<br />

<!-- repeat password field -->
<TextField
    bind:this={repeatPasswordInput}
    type="password"
    label="Passwort wiederholen"
    on:input={checkRepeatPassword}
    isInErrorState={repeatPasswordError}
/>
{#if repeatPasswordError}<span class="has-text-danger">Passwörter sind nicht identisch!</span>{/if}

<br />

<!-- registration button -->
<div class="has-text-centered">
    <Button
        text="Registrieren"
        class="is-primary"
        size="full-width"
        disabled={!allowRegistration}
        isLoading={isRegistrationProcessing}
        on:click={processRegistration}
    />
</div>
