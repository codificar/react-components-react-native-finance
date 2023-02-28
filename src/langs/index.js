
import GLOBAL from '../Functions/Global.js';

export const languages = (props) => {
    //If has lang from props, get form props, if not, get from global.
    if (props != undefined && props != null && props.lang != undefined && props.lang != null && props.lang.includes('pt-BR')) {
        return require('./pt-BR.json');
    }
    if (props != undefined && props != null && props.lang != undefined && props.lang != null && props.lang.includes("en")) {
        return require('./en.json');
    }
    if (GLOBAL.lang != undefined && GLOBAL.lang != null && GLOBAL.lang.includes("pt-BR")) {
        return require('./pt-BR.json');
    }
    if (GLOBAL.lang != undefined && GLOBAL.lang != null && GLOBAL.lang.includes("en")) {
        return require('./en.json');
    }
    //Get the lang from props. If hasn't lang in props, default is pt-BR
    return require('./pt-BR.json');
}
