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
            token: token,
            holder_type: 'provider',
            start_date: start_date,
            end_date: end_date
        })
        console.log(nextPageUrl + "&" + params);
        return fetch(nextPageUrl + "&" + params, this.config).then((response) => response.json());
    }

    GetCheckingAccount(app_url, provider_id, token, start_date, end_date) {
        let params = new URLSearchParams({ 
            provider_id: provider_id,
            token: token,
            holder_type: 'provider',
            start_date: start_date,
            end_date: end_date
        });
        console.log(app_url + "/api/v3/provider/financial/summary/" + provider_id + "?" + params);
        return fetch(app_url + "/api/v3/provider/financial/summary/" + provider_id + "?" + params, this.get).then((response) => response.json());
    }

    GetReport(app_url, provider_id, token, year) {
        let params = new URLSearchParams({ 
            provider_id: provider_id, 
            token: token, 
            year: year
        });
        console.log(app_url + "/api/v3/provider/profits" + "?" + params);
        return fetch(app_url + "/api/v3/provider/profits" + "?" + params, this.get).then((response) => response.json());
    }

}