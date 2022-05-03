import Fetch, { getAuthorizationHeader } from '../api/Fetch';
import CustomError, { ErrorCodes } from '../api/CustomError';

export default class Balance {

    /**
     * Requests the current balance for another user from the API
     * @param {string} userId the ID of the desired user
     * @returns {number} current balance
     */
    static async getBalanceForUser(userId) {
        const response = await Fetch.get(`balance/${userId}`, getAuthorizationHeader());
        return response.balance;
    }

    /**
     * Request to the API to set the balance to the specified value
     * @param {string} userId the ID of the desired user
     * @param {number} newBalance value the balance should be set to
     * @returns {number} current balance
     */
    static async setBalanceForUser(userId, newBalance) {
        if (!newBalance || Number.isNaN(newBalance) || typeof newBalance !== 'number') {
            throw new CustomError(ErrorCodes.BALANCE_NOT_A_NUMBER, 'Value needs to be a number');
        }

        const response = await Fetch.patch(`balance/${userId}`, {
            balance: newBalance
        }, getAuthorizationHeader());

        return response.balance;
    }

    /**
     * Request to the API to topup the balance with the specified value
     * @param {string} userId the ID of the desired user
     * @param {number} topupAmount value to add on top of balance
     * @returns {number} current balance
     */
    static async topupBalanceForUser(userId, topupAmount) {
        if (!topupAmount || Number.isNaN(topupAmount) || typeof topupAmount !== 'number') {
            throw new CustomError(ErrorCodes.TOPUP_AMOUNT_NOT_A_NUMBER, 'Value needs to be a number');
        }

        const response = await Fetch.post(`balance/${userId}/topup`, {
            amount: topupAmount
        }, getAuthorizationHeader());

        return response.balance;
    }

    /**
     * Request to the API to withdraw the balance with the specified value
     * @param {string} userId the ID of the desired user
     * @param {number} withDrawAmount value to subtract from the balance
     * @returns {number} current balance
     */
    static async withdrawBalanceForUser(userId, withDrawAmount) {
        if (!withDrawAmount || Number.isNaN(withDrawAmount) || typeof withDrawAmount !== 'number') {
            throw new CustomError(ErrorCodes.WITHDRAW_AMOUNT_NOT_A_NUMBER, 'Value needs to be a number');
        }

        const response = await Fetch.post(`balance/${userId}/withdraw`, {
            amount: withDrawAmount
        }, getAuthorizationHeader());

        return response.balance;
    }

    /**
     * Gets the balance history of the user
     * @param {string} userId unique user ID
     * @param {string} fromDate start date
     * @param {string} toDate end date
     * @param {number} offset offset for pagination if pagination required
     * @param {number} limit number of items per page for pagination
    */
    static async getHistory(userId, fromDate, toDate, offset, limit) {
        const url = `balance/${userId}/history`;
        const params = `fromDate=${fromDate}&toDate=${toDate}&offset=${offset}&limit=${limit}`;

        return Fetch.get(`${url}?${params}`, getAuthorizationHeader());
    }
}
