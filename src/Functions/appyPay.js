import GLOBAL from './Global.js';

export const DEFAULT_COLOR = '#2E7D32';

export const STATUS_COLORS = {
    pending: '#F9A825',
    credited: '#2E7D32',
    failed: '#C62828',
    expired: '#757575',
};

/**
 * Who is calling and where: explicit props first, then navigation params, and
 * only then the lib's GLOBAL cache. GLOBAL keeps the first value it ever saw,
 * so it can hold another session's token after a logout.
 */
export const resolveSession = (props) => {
    const params = (props.route && props.route.params)
        || (props.navigation && props.navigation.state && props.navigation.state.params)
        || {};
    const pick = (key, globalKey = key) => props[key] || params[key] || GLOBAL[globalKey];

    return {
        appUrl: pick('appUrl'),
        id: pick('id'),
        token: pick('token'),
        socketUrl: pick('socket_url'),
        lang: pick('lang'),
        color: props.PrimaryButton || params.color || GLOBAL.color || DEFAULT_COLOR,
    };
};

/**
 * 12000 -> "12.000,00 Kz". Done by hand: Intl is not available on every
 * Android JS engine the apps ship with.
 */
export const formatKz = (value) => {
    const [integer, decimals] = Number(value || 0).toFixed(2).split('.');
    return integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decimals + ' Kz';
};

/**
 * "923456789" -> "923 456 789"
 */
export const formatPhone = (phone) => (phone || '').replace(/(\d{3})(?=\d)/g, '$1 ').trim();

/**
 * "382962638" -> "382 962 638"
 */
export const formatReference = formatPhone;

/**
 * "2026-10-22T15:00:00" -> "22/10/2026 15:00"
 */
export const formatDateTime = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value || '');
    return match ? `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}` : '';
};

/**
 * Replaces {name} placeholders.
 */
export const interpolate = (text, values) => Object.keys(values).reduce(
    (result, key) => result.split('{' + key + '}').join(values[key]),
    text || ''
);
