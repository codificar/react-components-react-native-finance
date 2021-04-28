export default class Api {

    constructor() {
        this.get = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        };
        this.post = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        };
    }
    GetAccountSummary(nextPageUrl, provider_id, token, start_date, end_date) {
        let params = new URLSearchParams({ 
            provider_id: provider_id,
            id: provider_id,
            token: token,
            holder_type: 'provider',
            start_date: start_date,
            end_date: end_date
        })
        return fetch(nextPageUrl + "&" + params, this.config).then((response) => response.json());
    }

    GetCheckingAccount(app_url, provider_id, token, start_date, end_date) {
        let params = new URLSearchParams({ 
            provider_id: provider_id,
            id: provider_id,
            token: token,
            holder_type: 'provider',
            start_date: start_date,
            end_date: end_date
        });
        return fetch(app_url + "/libs/finance/provider/financial/provider_summary?" + params, this.get).then((response) => response.json());
    }

    GetReport(app_url, provider_id, token, year) {
        let params = new URLSearchParams({ 
            provider_id: provider_id, 
            id: provider_id,
            token: token, 
            year: year
        });
        return fetch(app_url + "/libs/finance/provider/profits" + "?" + params, this.get).then((response) => response.json());
    }

    GetCardsAndBalance(app_url, provider_id, token, type) {
        let params = new URLSearchParams({ 
            provider_id: provider_id, 
            user_id: provider_id,
            id: provider_id,
            token: token
        });
        return fetch(app_url + "/libs/finance/" + type + "/get_cards_and_balance" + "?" + params, this.get).then((response) => response.json());
    }

    AddCreditCardBalance(app_url, provider_id, token, value, card_id, type) {
        let params = new URLSearchParams({ 
            provider_id: provider_id, 
            user_id: provider_id,
            id: provider_id,
            token: token,
            value: value,
            card_id: card_id
        });
        return fetch(app_url + "/libs/finance/" + type + "/add_credit_card_balance" + "?" + params, this.get).then((response) => response.json());
    }

    AddBilletBalance(app_url, provider_id, token, value, type) {
        let params = new URLSearchParams({ 
            provider_id: provider_id, 
            user_id: provider_id,
            id: provider_id,
            token: token,
            value: value
        });
        return fetch(app_url + "/libs/finance/" + type + "/add_billet_balance" + "?" + params, this.get).then((response) => response.json());
    }

    AddCard(app_url, id, token, type, card_holder, card_number, card_cvv, card_expiration_year, card_expiration_month) {
        let params = {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
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
                card_expiration_month:card_expiration_month
            })
        }
        return fetch(app_url + "/libs/finance/" + type + "/add_credit_card", params).then((response) => response.json());
    }

}