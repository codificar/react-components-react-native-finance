//This file must be imported by the parent project that uses this model to function the navigation
//Este arquivo deve ser importado pelo projeto pai que utiliza esse modolo para funcionar a navegacao

import AddBalanceScreen from './src/AddBalanceScreen'
import AddCardScreenLib from './src/AddCardScreenLib'
import AddCardWebView from './src/AddCardWebView'
import PixScreen from './src/PixScreen'
import EarningsPeriodScreen from './src/EarningsPeriodScreen'
import EarningDetailScreen from './src/EarningDetailScreen'
import FilterScreen from './src/FilterScreen'

    const screens = {
        AddBalanceScreen: { screen: AddBalanceScreen },
        AddCardScreenLib: { screen: AddCardScreenLib },
        AddCardWebView: { screen: AddCardWebView },
        PixScreen: { screen: PixScreen },
        EarningsPeriodScreen: { screen: EarningsPeriodScreen },
        EarningDetailScreen: { screen: EarningDetailScreen },
        FilterScreen: { screen: FilterScreen }
    };

export default screens;