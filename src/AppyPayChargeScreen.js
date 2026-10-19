import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import io from 'socket.io-client';

import Api from './Functions/Api';
import Toast from './Functions/Toast';
import { languages } from './langs/index.js';
import {
    STATUS_COLORS,
    formatDateTime,
    formatKz,
    formatPhone,
    formatReference,
    interpolate,
    resolveSession,
} from './Functions/appyPay';

const POLL_INTERVAL_MS = 5000;
const PENDING = 'pending';

/**
 * Follows one AppyPay top-up until AppyPay settles it: the GPO waiting
 * screen, the REF entity/reference card, and the final outcome.
 *
 * Updates arrive on the charge's socket channel; polling and the return to
 * the foreground cover a socket that is down or a webhook that is late.
 */
const AppyPayChargeScreen = (props) => {
    const params = (props.route && props.route.params) || props.navigation.state.params || {};
    const session = params.session || resolveSession(props);
    const strings = languages({ lang: session.lang });

    const [charge, setCharge] = useState(params.charge);
    const [checking, setChecking] = useState(false);
    const mounted = useRef(true);
    const pending = charge.status === PENDING;

    useEffect(() => () => { mounted.current = false; }, []);

    const refresh = useCallback((manual = false) => {
        if (manual) {
            setChecking(true);
        }
        return new Api().GetAppyPayCharge(session.appUrl, session.id, session.token, charge.id)
            .then((json) => {
                if (!mounted.current) {
                    return;
                }
                if (json.success && json.charge) {
                    setCharge(json.charge);
                    if (manual && json.charge.status === PENDING) {
                        Toast.showToast(strings.appypay_not_paid_yet);
                    }
                }
            })
            .catch(() => null)
            .finally(() => mounted.current && setChecking(false));
    }, [charge.id]);

    // Polling while pending.
    useEffect(() => {
        if (!pending) {
            return undefined;
        }
        const timer = setInterval(() => refresh(), POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [pending]);

    // Real-time update from the server (laravel-echo-server).
    useEffect(() => {
        if (!pending || !session.socketUrl || !charge.channel) {
            return undefined;
        }
        const socket = io(session.socketUrl, { transports: ['websocket'], forceNew: true, reconnection: true });
        socket.on('connect', () => socket.emit('subscribe', { channel: charge.channel }));
        socket.on('appypayChargeUpdated', () => refresh());
        return () => {
            socket.emit('unsubscribe', { channel: charge.channel });
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [pending]);

    // Back from the Multicaixa Express app: the payment may be done already.
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                refresh();
            }
        });
        return () => subscription && subscription.remove && subscription.remove();
    }, []);

    useEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            props.navigation.goBack();
            return true;
        });
        return () => handler.remove();
    }, []);

    const copy = (value) => {
        Clipboard.setString(value);
        Toast.showToast(strings.appypay_copied);
    };

    const color = session.color;

    const renderPendingGpo = () => (
        <View style={styles.center}>
            <ActivityIndicator testID="appypay-waiting" size="large" color={color} style={styles.spinner} />
            <Text style={styles.title}>{strings.appypay_gpo_title}</Text>
            <Text style={styles.text}>
                {interpolate(strings.appypay_gpo_waiting, { amount: formatKz(charge.amount), phone: formatPhone(charge.phone_number) })}
            </Text>
            <Text style={[styles.text, styles.muted]}>{strings.appypay_waiting}</Text>
        </View>
    );

    const row = (label, value, copyValue) => (
        <View style={styles.row} key={label}>
            <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue} selectable>{value}</Text>
            </View>
            {copyValue ? (
                <TouchableOpacity style={[styles.copy, { borderColor: color }]} onPress={() => copy(copyValue)}>
                    <Text style={[styles.copyText, { color }]}>{strings.appypay_copy}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );

    const renderPendingRef = () => (
        <View>
            <Text style={styles.title}>{strings.appypay_ref_title}</Text>
            <Text style={styles.text}>{strings.appypay_ref_instructions}</Text>
            <View testID="appypay-reference-card" style={styles.card}>
                {row(strings.appypay_entity, charge.reference ? charge.reference.entity : '—', charge.reference && charge.reference.entity)}
                {row(strings.appypay_reference, charge.reference ? formatReference(charge.reference.number) : '—', charge.reference && charge.reference.number)}
                {row(strings.appypay_amount, formatKz(charge.amount), String(Math.round(charge.amount)))}
                {charge.reference && charge.reference.due_date
                    ? row(strings.appypay_due_date, formatDateTime(charge.reference.due_date))
                    : null}
            </View>
            <TouchableOpacity
                testID="appypay-check"
                style={[styles.button, { backgroundColor: color }]}
                disabled={checking}
                onPress={() => refresh(true)}
            >
                {checking ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{strings.appypay_check_payment}</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderOutcome = () => {
        const credited = charge.status === 'credited';
        const title = credited
            ? strings.appypay_credited_title
            : (charge.status === 'expired' ? strings.appypay_expired_title : strings.appypay_failed_title);

        return (
            <View style={styles.center} testID={'appypay-outcome-' + charge.status}>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[charge.status] }]}>
                    <Text style={styles.badgeText}>{credited ? '✓' : '!'}</Text>
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>
                    {credited
                        ? interpolate(strings.appypay_credited, { amount: formatKz(charge.confirmed_amount || charge.amount) })
                        : (charge.failure_reason || charge.status_name)}
                </Text>
                <TouchableOpacity
                    testID="appypay-done"
                    style={[styles.button, styles.wide, { backgroundColor: color }]}
                    onPress={() => props.navigation.goBack()}
                >
                    <Text style={styles.buttonText}>{credited ? strings.appypay_done : strings.appypay_try_again}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity testID="appypay-back" onPress={() => props.navigation.goBack()} style={styles.back}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{charge.method_name}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {pending ? (charge.method === 'GPO' ? renderPendingGpo() : renderPendingRef()) : renderOutcome()}
                <Text style={styles.footer}>{strings.appypay_transaction} {charge.merchant_transaction_id}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 10 },
    back: { paddingHorizontal: 10, paddingVertical: 2 },
    backText: { fontSize: 34, color: '#222' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
    content: { padding: 25 },
    center: { alignItems: 'center' },
    spinner: { marginVertical: 30, transform: [{ scale: 1.5 }] },
    title: { fontSize: 22, fontWeight: 'bold', color: '#222', textAlign: 'center', marginBottom: 12 },
    text: { fontSize: 16, color: '#444', textAlign: 'center', lineHeight: 22, marginBottom: 10 },
    muted: { color: '#888', fontSize: 14 },
    card: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 14, marginVertical: 16 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 13, color: '#888' },
    rowValue: { fontSize: 20, fontWeight: 'bold', color: '#222', letterSpacing: 0.5 },
    copy: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 5 },
    copyText: { fontWeight: 'bold', fontSize: 13 },
    button: { borderRadius: 6, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
    wide: { alignSelf: 'stretch', marginTop: 24 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    badge: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginVertical: 24 },
    badgeText: { color: '#fff', fontSize: 44, fontWeight: 'bold' },
    footer: { textAlign: 'center', color: '#AAA', fontSize: 12, marginTop: 30 },
});

export default AppyPayChargeScreen;
