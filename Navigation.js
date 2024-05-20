//This file must be imported by the parent project that uses this model to function the navigation
//Este arquivo deve ser importado pelo projeto pai que utiliza esse modolo para funcionar a navegacao

import EarningsPeriodScreen from './src/EarningsPeriodScreen'
import EarningDetailScreen from './src/EarningDetailScreen'
import FilterScreen from './src/FilterScreen'
import AddBalanceScreen from './src/AddBalanceScreen'
import AddCardScreenLib from './src/AddCardScreenLib'
import DebitActiveScreen from './src/DebitActiveScreen'
import AddCardWebView from './src/AddCardWebView'
import PixScreen from './src/PixScreen'
import PixQrCode from './src/PixQrCode'
import AddCardWebViewBancard from './src/AddCardWebViewBancard'

const screens = {
    EarningsPeriodScreen: { screen: EarningsPeriodScreen },
    EarningDetailScreen: { screen: EarningDetailScreen },
    FilterScreen: { screen: FilterScreen },
    AddBalanceScreen: { screen: AddBalanceScreen },
    DebitActiveScreen: { screen: DebitActiveScreen },
    AddCardScreenLib: { screen: AddCardScreenLib },
    AddCardWebView: { screen: AddCardWebView },
    AddCardWebViewBancard: { screen: AddCardWebViewBancard },
    PixScreen: { screen: PixScreen },
    PixQrCode: { screen: PixQrCode }
};

export {
    AddCardWebViewBancard,
    AddCardWebView,
    AddCardScreenLib,
    EarningDetailScreen,
    FilterScreen,
    AddBalanceScreen,
    EarningsPeriodScreen,
    PixScreen
}

export default screens;