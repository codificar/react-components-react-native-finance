//This file must be imported by the parent project that uses this model to function the navigation
//Este arquivo deve ser importado pelo projeto pai que utiliza esse modolo para funcionar a navegacao

import AddBalanceScreen from './src/AddBalanceScreen'
import AddCardScreenLib from './src/AddCardScreenLib'
import AddCardWebView from './src/AddCardWebView'

    const screens = {
        AddBalanceScreen: { screen: AddBalanceScreen },
        AddCardScreenLib: { screen: AddCardScreenLib },
        AddCardWebView: { screen: AddCardWebView }
    };

export default screens;