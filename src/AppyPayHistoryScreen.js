import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';

import Api from './Functions/Api';
import { languages } from './langs/index.js';
import { STATUS_COLORS, formatDateTime, formatKz, resolveSession } from './Functions/appyPay';

/**
 * The driver's AppyPay top-ups, newest first, each with its status.
 */
const AppyPayHistoryScreen = (props) => {
    const params = (props.route && props.route.params) || props.navigation.state.params || {};
    const session = params.session || resolveSession(props);
    const strings = languages({ lang: session.lang });

    const [charges, setCharges] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const mounted = useRef(true);

    useEffect(() => () => { mounted.current = false; }, []);

    const load = useCallback((pageToLoad) => {
        setLoading(true);
        return new Api().GetAppyPayCharges(session.appUrl, session.id, session.token, pageToLoad)
            .then((json) => {
                if (!mounted.current || !json.success) {
                    return;
                }
                setCharges((current) => (pageToLoad === 1 ? json.charges : current.concat(json.charges)));
                setPage(json.current_page);
                setLastPage(json.last_page);
            })
            .catch(() => null)
            .finally(() => mounted.current && setLoading(false));
    }, []);

    useEffect(() => {
        load(1);
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            props.navigation.goBack();
            return true;
        });
        return () => handler.remove();
    }, []);

    const open = (charge) => props.navigation.navigate('AppyPayChargeScreen', { charge, session });

    const renderItem = ({ item }) => (
        <TouchableOpacity testID={'appypay-history-' + item.id} style={styles.item} onPress={() => open(item)}>
            <View style={styles.itemText}>
                <Text style={styles.method}>{item.method_name}</Text>
                <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
                {item.method === 'REF' && item.status === 'pending' && item.reference ? (
                    <Text style={styles.date}>{strings.appypay_entity} {item.reference.entity} · {strings.appypay_reference} {item.reference.number}</Text>
                ) : null}
            </View>
            <View style={styles.itemRight}>
                <Text style={styles.amount}>{formatKz(item.confirmed_amount || item.amount)}</Text>
                <View style={[styles.status, { backgroundColor: STATUS_COLORS[item.status] }]}>
                    <Text style={styles.statusText}>{item.status_name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <NavigationEvents onWillFocus={() => load(1)} />
            <View style={styles.header}>
                <TouchableOpacity testID="appypay-back" onPress={() => props.navigation.goBack()} style={styles.back}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{strings.appypay_history}</Text>
            </View>
            <FlatList
                data={charges}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                refreshing={loading && page === 1}
                onRefresh={() => load(1)}
                onEndReachedThreshold={0.3}
                onEndReached={() => { if (!loading && page < lastPage) { load(page + 1); } }}
                ListEmptyComponent={loading ? null : <Text style={styles.empty}>{strings.appypay_history_empty}</Text>}
                ListFooterComponent={loading && page > 1 ? <ActivityIndicator style={styles.more} /> : null}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 10 },
    back: { paddingHorizontal: 10, paddingVertical: 2 },
    backText: { fontSize: 34, color: '#222' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
    list: { paddingHorizontal: 20, paddingBottom: 20 },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0' },
    itemText: { flex: 1, paddingRight: 10 },
    method: { fontSize: 15, fontWeight: 'bold', color: '#222' },
    date: { fontSize: 13, color: '#777', marginTop: 2 },
    itemRight: { alignItems: 'flex-end' },
    amount: { fontSize: 15, fontWeight: 'bold', color: '#222' },
    status: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 15 },
    more: { marginVertical: 12 },
});

export default AppyPayHistoryScreen;
