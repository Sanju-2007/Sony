import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Tabs, useRouter, usePathname } from "expo-router";
import { Disc, Compass, Users, MessageSquare, User, Radio, Plus, Sparkles } from "lucide-react-native";
import { colors, typography } from "../../src/theme/tokens";
import { MiniPlayer } from "../../src/components/player/MiniPlayer";
import { CreateRoomModal } from "../../src/components/room/CreateRoomModal";
import { ThemeToggleButton } from "../../src/components/theme/ThemeToggleButton";
import { useThemeStore } from "../../src/store/themeStore";

export default function TabLayout() {
  const { isDark, palette } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [showCreateModal, setShowCreateModal] = useState(false);

  const navItems = [
    { title: "Home", route: "/(tabs)", icon: Disc },
    { title: "Discover", route: "/(tabs)/discover", icon: Compass },
    { title: "Friends", route: "/(tabs)/friends", icon: Users },
    { title: "Messages", route: "/(tabs)/messages", icon: MessageSquare },
    { title: "Profile", route: "/(tabs)/profile", icon: User },
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* DESKTOP SIDEBAR */}
      {isDesktop && (
        <View
          style={[
            styles.sidebar,
            {
              backgroundColor: palette.surface,
              borderRightColor: palette.border,
            },
          ]}
        >
          {/* Brand */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/")}
            style={styles.brandRow}
            accessibilityLabel="Replay opening intro"
          >
            <View style={[styles.logoBadge, { backgroundColor: palette.accent }]}>
              <Radio size={18} color={palette.accentInverted} />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: palette.textPrimary }]}>SONY MUSIC</Text>
              <Text style={[styles.brandSubtitle, { color: palette.textTertiary }]}>Social Listening</Text>
            </View>
          </TouchableOpacity>

          {/* Quick Create Room */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.createBtn, { backgroundColor: palette.accent }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={16} color={palette.accentInverted} style={{ marginRight: 8 }} />
            <Text style={[styles.createBtnText, { color: palette.accentInverted }]}>Start Room</Text>
          </TouchableOpacity>

          {/* Navigation Links */}
          <View style={styles.navGroup}>
            <Text style={[styles.navHeader, { color: palette.textTertiary }]}>MENU</Text>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.route === "/(tabs)"
                  ? pathname === "/(tabs)" || pathname === "/" || pathname === ""
                  : pathname.includes(item.route.replace("/(tabs)/", ""));

              return (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.75}
                  style={[
                    styles.navItem,
                    isActive && [
                      styles.navItemActive,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.06)",
                      },
                    ],
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <Icon
                    size={18}
                    color={isActive ? palette.textPrimary : palette.textTertiary}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      { color: isActive ? palette.textPrimary : palette.textTertiary },
                      isActive && styles.navLabelActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Theme & Engine Status */}
          <View style={[styles.sidebarFooter, { borderTopColor: palette.borderSubtle }]}>
            <View style={{ marginBottom: 10 }}>
              <ThemeToggleButton showLabel />
            </View>

            <View
              style={[
                styles.engineBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.04)",
                },
              ]}
            >
              <Sparkles size={13} color={palette.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.engineText, { color: palette.textPrimary }]}>
                Ducking Engine Active
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* MAIN SCREEN AREA VIA TABS */}
      <View style={[styles.mainContent, isDesktop && { paddingBottom: 74 }]}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: palette.textPrimary,
            tabBarInactiveTintColor: palette.textTertiary,
            tabBarStyle: {
              display: isDesktop ? "none" : "flex",
              backgroundColor: palette.surface,
              borderTopColor: palette.border,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => <Disc size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="discover"
            options={{
              title: "Discover",
              tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="friends"
            options={{
              title: "Friends",
              tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: "Messages",
              tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
            }}
          />
        </Tabs>

        {/* PERSISTENT MINI PLAYER BAR */}
        <MiniPlayer />
      </View>

      {/* CREATE ROOM MODAL */}
      <CreateRoomModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(id) => router.push(`/room/${id}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  sidebar: {
    width: 240,
    height: "100%",
    borderRightWidth: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
    zIndex: 50,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 11,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  navGroup: {
    flex: 1,
    gap: 4,
  },
  navHeader: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 12,
  },
  navItemActive: {},
  navLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  navLabelActive: {
    fontWeight: "700",
  },
  sidebarFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  engineBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  engineText: {
    fontSize: 11,
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
    height: "100%",
  },
});
