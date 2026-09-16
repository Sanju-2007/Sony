import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Tabs, useRouter, usePathname } from "expo-router";
import { Disc, Compass, Users, MessageSquare, User, Radio, Plus, Sparkles } from "lucide-react-native";
import { colors, typography } from "../../src/theme/tokens";
import { MiniPlayer } from "../../src/components/player/MiniPlayer";
import { CreateRoomModal } from "../../src/components/room/CreateRoomModal";

export default function TabLayout() {
  const palette = colors.dark;
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
    <View style={styles.container}>
      {/* DESKTOP SIDEBAR */}
      {isDesktop && (
        <View style={styles.sidebar}>
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Radio size={18} color="#6366F1" />
            </View>
            <View>
              <Text style={styles.brandTitle}>SONY MUSIC</Text>
              <Text style={styles.brandSubtitle}>Social Listening</Text>
            </View>
          </View>

          {/* Quick Create Room */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.createBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.createBtnText}>Start Room</Text>
          </TouchableOpacity>

          {/* Navigation Links */}
          <View style={styles.navGroup}>
            <Text style={styles.navHeader}>MENU</Text>
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
                    isActive && styles.navItemActive,
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <Icon
                    size={18}
                    color={isActive ? "#F8FAFC" : "#94A3B8"}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <Text
                    style={[
                      styles.navLabel,
                      isActive && styles.navLabelActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Audio Engine Status */}
          <View style={styles.sidebarFooter}>
            <View style={styles.engineBadge}>
              <Sparkles size={13} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.engineText}>Ducking Engine Active</Text>
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
              backgroundColor: palette.background,
              borderTopColor: palette.borderSubtle,
              borderTopWidth: 1,
              height: 64,
              paddingBottom: 10,
              paddingTop: 8,
              elevation: 0,
            },
            tabBarLabelStyle: {
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
              letterSpacing: typography.letterSpacing.tight,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => <Disc size={20} color={color} strokeWidth={1.8} />,
            }}
          />
          <Tabs.Screen
            name="discover"
            options={{
              title: "Discover",
              tabBarIcon: ({ color }) => <Compass size={20} color={color} strokeWidth={1.8} />,
            }}
          />
          <Tabs.Screen
            name="friends"
            options={{
              title: "Friends",
              tabBarIcon: ({ color }) => <Users size={20} color={color} strokeWidth={1.8} />,
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: "Messages",
              tabBarIcon: ({ color }) => <MessageSquare size={20} color={color} strokeWidth={1.8} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color }) => <User size={20} color={color} strokeWidth={1.8} />,
            }}
          />
        </Tabs>
      </View>

      {/* Persistent Floating or Full-width Desktop MiniPlayer */}
      <MiniPlayer isDesktop={isDesktop} />

      {/* Modal for Quick Room Creation from Desktop Sidebar */}
      <CreateRoomModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(id) => router.push("/room/" + id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#090A0F",
    position: "relative",
    width: "100%",
    height: "100%",
  },
  sidebar: {
    width: 230,
    backgroundColor: "#0D0F14",
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 84, // Clear bottom player
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#F8FAFC",
  },
  brandSubtitle: {
    fontSize: 11,
    color: "#64748B",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 24,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  navGroup: {
    flex: 1,
    gap: 4,
  },
  navHeader: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#475569",
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
  navItemActive: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94A3B8",
  },
  navLabelActive: {
    color: "#F8FAFC",
    fontWeight: "700",
  },
  sidebarFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  engineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  engineText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "500",
  },
  mainContent: {
    flex: 1,
    height: "100%",
  },
});
