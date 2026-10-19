import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import Api from '../Functions/Api';
import { formatKz, interpolate } from '../Functions/appyPay';

const GPO = 'GPO';

/**
 * Amount + method (Multicaixa Express or reference) + phone for GPO.
 * The server validates everything again; this only avoids a round trip.
 */
const TopUpForm = ({ config, session, strings, initialAmount, onCreated, onOpenHistory }) => {
    const presets = config.preset_amounts || [];
    const startAmount = initialAmount ? Math.max(Math.ceil(initialAmount), config.min_amount) : null;
    const startsWithPreset = !startAmount || presets.indexOf(startAmount) >= 0;

    const [preset, setPreset] = useState(startsWithPreset ? startAmount : null);
    const [customAmount, setCustomAmount] = useState(startsWithPreset ? '' : String(startAmount));
    const [method, setMethod] = useState(config.methods.length ? config.methods[0].key : null);
    const [phone, setPhone] = useState(config.phone_number || '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const amount = customAmount ? parseInt(customAmount, 10) : preset;
    const limits = { min: formatKz(config.min_amount), max: formatKz(config.max_amount) };

    const validationError = () => {
        if (!amount || amount < config.min_amount || amount > config.max_amount) {
            return interpolate(strings.appypay_invalid_amount, limits);
        }
        if (method === GPO && !/^9\d{8}$/.test(phone)) {
            return strings.appypay_invalid_phone;
        }
        return null;
    };

    const submit = () => {
        const invalid = validationError();
        setError(invalid);
        if (invalid || submitting) {
            return;
        }

        setSubmitting(true);
        new Api().CreateAppyPayCharge(session.appUrl, session.id, session.token, amount, method, method === GPO ? phone : null)
            .then((json) => {
                setSubmitting(false);
                if (json.success && json.charge) {
                    onCreated(json.charge);
                } else {
                    setError((json.errors && json.errors.join('\n')) || json.error || strings.appypay_error);
                }
            })
            .catch(() => {
                setSubmitting(false);
                setError(strings.appypay_error);
            });
    };

    const color = session.color;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{strings.appypay_choose_amount}</Text>
            <View style={styles.presets}>
                {presets.map((value) => {
                    const selected = !customAmount && preset === value;
                    return (
                        <TouchableOpacity
                            key={value}
                            testID={'appypay-amount-' + value}
                            style={[styles.preset, selected && { borderColor: color, backgroundColor: color }]}
                            onPress={() => { setPreset(value); setCustomAmount(''); setError(null); }}
                        >
                            <Text style={[styles.presetText, selected && styles.selectedText]}>{formatKz(value)}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <TextInput
                testID="appypay-custom-amount"
                style={[styles.input, customAmount ? { borderColor: color } : null]}
                keyboardType="number-pad"
                placeholder={strings.appypay_other_amount}
                value={customAmount}
                onChangeText={(text) => { setCustomAmount(text.replace(/\D/g, '')); setError(null); }}
            />
            <Text style={styles.hint}>{interpolate(strings.appypay_limits, limits)}</Text>

            <Text style={styles.sectionTitle}>{strings.appypay_choose_method}</Text>
            {config.methods.map(({ key, name }) => {
                const selected = method === key;
                return (
                    <TouchableOpacity
                        key={key}
                        testID={'appypay-method-' + key}
                        style={[styles.method, selected && { borderColor: color }]}
                        onPress={() => { setMethod(key); setError(null); }}
                    >
                        <View style={[styles.radio, selected && { borderColor: color }]}>
                            {selected ? <View style={[styles.radioDot, { backgroundColor: color }]} /> : null}
                        </View>
                        <View style={styles.methodText}>
                            <Text style={styles.methodName}>{name}</Text>
                            <Text style={styles.hint}>{key === GPO ? strings.appypay_gpo_hint : strings.appypay_ref_hint}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}

            {method === GPO ? (
                <View>
                    <Text style={styles.label}>{strings.appypay_phone}</Text>
                    <TextInput
                        testID="appypay-phone"
                        style={styles.input}
                        keyboardType="phone-pad"
                        maxLength={9}
                        value={phone}
                        onChangeText={(text) => { setPhone(text.replace(/\D/g, '')); setError(null); }}
                    />
                </View>
            ) : null}

            {error ? <Text testID="appypay-error" style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
                testID="appypay-submit"
                style={[styles.button, { backgroundColor: color }, submitting && styles.disabled]}
                disabled={submitting}
                onPress={submit}
            >
                {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>{interpolate(strings.appypay_pay, { amount: amount ? formatKz(amount) : '' })}</Text>}
            </TouchableOpacity>

            <TouchableOpacity testID="appypay-history" style={styles.link} onPress={onOpenHistory}>
                <Text style={[styles.linkText, { color }]}>{strings.appypay_history}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 5, paddingBottom: 30 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#222' },
    presets: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
    preset: {
        borderWidth: 1, borderColor: '#C4C4C4', borderRadius: 6, paddingVertical: 10,
        width: '31%', marginHorizontal: '1%', marginBottom: 8, alignItems: 'center',
    },
    presetText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    selectedText: { color: '#fff' },
    input: {
        borderWidth: 1, borderColor: '#C4C4C4', borderRadius: 6, paddingHorizontal: 12,
        paddingVertical: 8, fontSize: 16, color: '#222', marginTop: 4,
    },
    hint: { fontSize: 13, color: '#777', marginTop: 4 },
    method: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0',
        borderRadius: 6, padding: 12, marginBottom: 8,
    },
    radio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#9E9E9E',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    radioDot: { width: 10, height: 10, borderRadius: 5 },
    methodText: { flex: 1 },
    methodName: { fontSize: 15, fontWeight: 'bold', color: '#222' },
    label: { fontSize: 14, color: '#555', marginTop: 10 },
    error: { color: '#C62828', marginTop: 12, fontSize: 14 },
    button: { marginTop: 20, borderRadius: 6, paddingVertical: 14, alignItems: 'center' },
    disabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link: { alignItems: 'center', marginTop: 16 },
    linkText: { fontSize: 15, fontWeight: 'bold' },
});

export default TopUpForm;
