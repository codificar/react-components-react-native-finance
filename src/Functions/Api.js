export default class Api {
    constructor() {
        this.get = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        };
        this.post = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        };
    }
    GetAccountSummary(nextPageUrl, provider_id, token, start_date, end_date) {
        let params = new URLSearchParams({
            provider_id: provider_id,
            id: provider_id,
            token: token,
            holder_type: 'provider',
            start_date: start_date,
            end_date: end_date,
        });
        return fetch(nextPageUrl + '&' + params, this.config).then((response) =>
            response.json()
        );
    }

    GetCheckingAccount(
        app_url,
        provider_id,
        token,
        start_date,
        end_date,
        type = 'provider'
    ) {
        let params = new URLSearchParams({
            provider_id: provider_id,
            id: provider_id,
            token: token,
            holder_type: type,
            start_date: start_date,
            end_date: end_date,
        });

        if (type == 'user')
            return fetch(
                app_url + '/libs/finance/user/financial/user_summary?' + params,
                this.get
            ).then((response) => response.json());

        return fetch(
            app_url +
                '/libs/finance/provider/financial/provider_summary?' +
                params,
            this.get
        ).then((response) => response.json());
    }

    GetReport(app_url, provider_id, token, year, type) {
        if (type == 'user') {
            let params = new URLSearchParams({
                user_id: provider_id,
                id: provider_id,
                token: token,
                year: year,
            });

            return fetch(
                app_url + '/libs/finance/user/profits' + '?' + params,
                this.get
            ).then((response) => response.json());
        }

        let params = new URLSearchParams({
            provider_id: provider_id,
            id: provider_id,
            token: token,
            year: year,
        });
        return fetch(
            app_url + '/libs/finance/provider/profits' + '?' + params,
            this.get
        ).then((response) => response.json());
    }

    GetCardsAndBalance(app_url, provider_id, token, type) {
        let params = new URLSearchParams({
            provider_id: provider_id,
            user_id: provider_id,
            id: provider_id,
            token: token,
        });
        return fetch(
            app_url +
                '/libs/finance/' +
                type +
                '/get_cards_and_balance' +
                '?' +
                params,
            this.get
        ).then((response) => response.json());
    }

    AddCreditCardBalance(app_url, provider_id, token, value, card_id, type) {
        let params = new URLSearchParams({
            provider_id: provider_id,
            user_id: provider_id,
            id: provider_id,
            token: token,
            value: value,
            card_id: card_id,
        });
        return fetch(
            app_url +
                '/libs/finance/' +
                type +
                '/add_credit_card_balance' +
                '?' +
                params,
            this.get
        ).then((response) => response.json());
    }

    AddBilletBalance(app_url, provider_id, token, value, type) {
        let params = new URLSearchParams({
            provider_id: provider_id,
            user_id: provider_id,
            id: provider_id,
            token: token,
            value: value,
        });
        return fetch(
            app_url +
                '/libs/finance/' +
                type +
                '/add_billet_balance' +
                '?' +
                params,
            this.get
        ).then((response) => response.json());
    }

    AddCard(
        app_url,
        id,
        token,
        type,
        card_holder,
        card_number,
        card_cvv,
        card_expiration_year,
        card_expiration_month,
    ) {
        let params = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                provider_id: id,
                user_id: id,
                token: token,
                card_holder: card_holder,
                card_number: card_number,
                card_cvv: card_cvv,
                card_expiration_year: card_expiration_year,
                card_expiration_month: card_expiration_month,
            }),
        };
        return fetch(
            app_url + '/libs/finance/' + type + '/add_credit_card',
            params
        ).then((response) => response.json());
    }

    RemoveCard(removeCardUrl, id, token, card_id) {
        let params = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                token: token,
                card_id: card_id,
            }),
        };
        return fetch(removeCardUrl, params).then((response) => response.json());
    }

    AddPixBalance(app_url, id, token, value, type) {
        let params = new URLSearchParams({
            provider_id: id,
            user_id: id,
            id: id,
            token: token,
            value: value,
        });
        return fetch(
            app_url +
                '/libs/finance/' +
                type +
                '/add_pix_balance' +
                '?' +
                params,
            this.get
        ).then((response) => response.json());
    }

    RetrievePix(app_url, id, token, transaction_id, request_id, type) {
        let params = new URLSearchParams({
            provider_id: id,
            user_id: id,
            id: id,
            token: token,
            transaction_id: transaction_id,
            request_id: request_id,
        });
        return fetch(
            app_url + '/libs/finance/' + type + '/retrieve_pix' + '?' + params,
            this.get
        )
            .then((response) => response.json())
            .catch((error) => error);
    }

    getProviderPayment(app_url, id, token) {
        return fetch(
            `${app_url}/libs/gateways/provider/get_payments?id=${id}&token=${token}`,
            this.get
        ).then((response) => response.json());
    }

    getPaymentInfo(app_url) {
        return fetch(`${app_url}/libs/gateways/payment_methods`, this.get).then(
            (response) => response.json()
        );
    }

    setProviderPayment(app_url, id, token, payments) {
        let params = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                token: token,
                provider_payment: payments,
            }),
        };
        return fetch(
            `${app_url}/libs/gateways/provider/set_payments`,
            params
        ).then((response) => response.json());
    }

    getPaymentTypes(app_url, id, token) {
        let params = new URLSearchParams({
            provider_id: id,
            id: id,
            token: token,
        });
        return fetch(
            app_url +
                '/libs/finance/provider/change_pix_payment_types' +
                '?' +
                params,
            this.get
        ).then((response) => response.json());
    }
    changePaymentType(app_url, id, token, request_id, new_payment_mode) {
        let params = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider_id: id,
                id: id,
                token: token,
                request_id: request_id,
                new_payment_mode: new_payment_mode,
            }),
        };
        return fetch(
            app_url + '/libs/finance/provider/change_pix_payment',
            params
        ).then((response) => response.json());
    }

	/**
	 * Recupera o saldo do provider
	 *
	 * @param {int} provider_id
	 * @param {string} token
	 */
    getBalance(app_url, key, id, token) {
        let params = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                [key]: id,
                token,
            }),
        };
        return fetch(app_url, params).then((response) => response.json());
    }

}
