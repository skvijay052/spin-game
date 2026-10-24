import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const GOLD = '#F5C451';
const PANEL = '#171A23';
const MUTED = '#9BA2B3';

export default function App() {
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('Ready for a friendly duel?');
  const [coins, setCoins] = useState(1000);

  useEffect(() => {
    const listener = rotation.addListener(({ value }) => {
      // The animated value is intentionally kept local for this UI prototype.
      void value;
    });
    return () => rotation.removeListener(listener);
  }, [rotation]);

  const spin = () => {
    if (spinning || coins < 10) return;
    setSpinning(true);
    setResult('The wheel is spinning…');
    setCoins((value) => value - 10);
    rotation.setValue(0);
    Animated.timing(rotation, {
      toValue: 5 + Math.random() * 3,
      duration: 2600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setResult('Demo spin complete · no cash prizes');
        setSpinning(false);
      }
    });
  };

  const rotate = rotation.interpolate({ inputRange: [0, 8], outputRange: ['0deg', '2880deg'] });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}><Text style={styles.logoText}>S</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>SPIN DUEL</Text>
            <Text style={styles.tagline}>ONE SPIN. ONE WINNER.</Text>
          </View>
          <View style={styles.coinPill}><Text style={styles.coinIcon}>◈</Text><Text style={styles.coinText}>{coins.toLocaleString()}</Text></View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>THE 1V1 ARENA</Text>
          <Text style={styles.title}>Ready to{ '\n' }<Text style={styles.gold}>spin?</Text></Text>
          <Text style={styles.subtitle}>Challenge a player and let the wheel decide your demo match.</Text>
        </View>

        <View style={styles.arena}>
          <View style={styles.players}>
            <View style={styles.player}><View style={styles.avatar}><Text style={styles.avatarText}>YOU</Text></View><Text style={styles.playerName}>You</Text><Text style={styles.playerLabel}>PLAYER 1</Text></View>
            <View style={styles.vs}><Text style={styles.vsText}>VS</Text></View>
            <View style={styles.player}><View style={[styles.avatar, styles.opponentAvatar]}><Text style={styles.avatarText}>?</Text></View><Text style={styles.playerName}>Opponent</Text><Text style={styles.playerLabel}>PLAYER 2</Text></View>
          </View>
          <View style={styles.wheelWrap}>
            <View style={styles.pointer} />
            <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
              <View style={styles.wheelHalfOne} /><View style={styles.wheelHalfTwo} />
              <View style={styles.wheelCenter}><Text style={styles.wheelCenterText}>SPIN</Text></View>
            </Animated.View>
          </View>
          <Text style={styles.result}>{result}</Text>
          <Pressable accessibilityRole="button" onPress={spin} disabled={spinning || coins < 10} style={({ pressed }) => [styles.button, (spinning || coins < 10) && styles.buttonDisabled, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>{spinning ? 'SPINNING…' : 'SPIN THE WHEEL  →'}</Text>
          </Pressable>
          <Text style={styles.entry}>ENTRY <Text style={styles.entryGold}>10 DEMO COINS</Text> · NO REAL MONEY</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>1v1</Text><Text style={styles.statLabel}>DUEL MODE</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>10</Text><Text style={styles.statLabel}>DEMO ENTRY</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>FREE</Text><Text style={styles.statLabel}>TO PLAY</Text></View>
        </View>
        <Text style={styles.footer}>Prototype build · Virtual coins have no cash value.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0D12' },
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 42, height: 42, borderRadius: 14, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#111319', fontWeight: '900', fontSize: 25 },
  brand: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 2.3, fontSize: 15 },
  tagline: { color: MUTED, fontSize: 9, letterSpacing: 1.5, marginTop: 3 },
  coinPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: PANEL, borderColor: '#34313A', borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 },
  coinIcon: { color: GOLD, fontSize: 17 }, coinText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  hero: { marginTop: 28, marginBottom: 18 }, eyebrow: { color: GOLD, fontSize: 10, letterSpacing: 2.5, fontWeight: '800' },
  title: { color: '#FFF', fontSize: 40, fontWeight: '900', lineHeight: 43, marginTop: 8, letterSpacing: -1.3 }, gold: { color: GOLD },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 9, maxWidth: 290 },
  arena: { backgroundColor: PANEL, borderColor: '#2A2D38', borderWidth: 1, borderRadius: 28, padding: 18, alignItems: 'center' },
  players: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, player: { alignItems: 'center', minWidth: 78 },
  avatar: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#2B2A24', borderWidth: 1, borderColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  opponentAvatar: { backgroundColor: '#252936', borderColor: '#596074' }, avatarText: { color: GOLD, fontSize: 12, fontWeight: '900' },
  playerName: { color: '#FFF', fontWeight: '700', fontSize: 12, marginTop: 7 }, playerLabel: { color: MUTED, fontSize: 8, letterSpacing: 1.3, marginTop: 3 },
  vs: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#252832', alignItems: 'center', justifyContent: 'center' }, vsText: { color: GOLD, fontWeight: '900', fontSize: 12 },
  wheelWrap: { width: 174, height: 174, alignItems: 'center', justifyContent: 'center', marginTop: 19, marginBottom: 12 },
  wheel: { width: 158, height: 158, borderRadius: 79, borderWidth: 5, borderColor: '#F7D87F', backgroundColor: '#252936', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  wheelHalfOne: { position: 'absolute', width: 158, height: 158, backgroundColor: GOLD, right: 0, top: 0, borderTopRightRadius: 79, borderBottomRightRadius: 79 },
  wheelHalfTwo: { position: 'absolute', width: 79, height: 158, left: 0, top: 0, backgroundColor: '#353947' },
  wheelCenter: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#0B0D12', borderWidth: 4, borderColor: '#F7D87F', alignItems: 'center', justifyContent: 'center' },
  wheelCenterText: { color: '#FFF', fontWeight: '900', letterSpacing: 1.5, fontSize: 11 },
  pointer: { position: 'absolute', zIndex: 2, top: 0, width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 20, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFF' },
  result: { color: MUTED, fontSize: 11, textAlign: 'center', minHeight: 18, marginBottom: 12 },
  button: { backgroundColor: GOLD, borderRadius: 16, width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  buttonDisabled: { opacity: 0.65 }, buttonPressed: { transform: [{ scale: 0.985 }] }, buttonText: { color: '#17140B', fontWeight: '900', letterSpacing: 1.1, fontSize: 12 },
  entry: { color: MUTED, fontSize: 9, letterSpacing: 1, marginTop: 12 }, entryGold: { color: GOLD, fontWeight: '900' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#11141B', borderRadius: 18, marginTop: 14, paddingVertical: 13, borderWidth: 1, borderColor: '#222631' },
  stat: { alignItems: 'center', flex: 1 }, statValue: { color: '#FFF', fontWeight: '900', fontSize: 16 }, statLabel: { color: MUTED, fontSize: 8, letterSpacing: 1.1, marginTop: 4 }, statDivider: { width: 1, height: 28, backgroundColor: '#2D303A' },
  footer: { textAlign: 'center', color: '#686F7E', fontSize: 9, marginTop: 'auto', paddingTop: 12 },
});
