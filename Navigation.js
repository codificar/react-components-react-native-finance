//This file must be imported by the parent project that uses this model to function the navigation
//Este arquivo deve ser importado pelo projeto pai que utiliza esse modolo para funcionar a navegacao

import EarningsPeriodScreen from './src/EarningsPeriodScreen'
import EarningDetailScreen from './src/EarningDetailScreen'
import FilterScreen from './src/FilterScreen'

    const screens = {
        EarningsPeriodScreen: { screen: EarningsPeriodScreen },
        EarningDetailScreen: { screen: EarningDetailScreen },
        FilterScreen: { screen: FilterScreen }
    };

export default screens;