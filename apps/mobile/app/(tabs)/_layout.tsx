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
              <Radio size={18} color="#FFFFFF" />
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
                    color={isActive ? "#0A0A0A" : "#71717A"}
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
              <Sparkles size={13} color="#0A0A0A" style={{ marginRight: 6 }} />
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
            tabBarActiveTintColor: "#0A0A0A",
            tabBarInactiveTintColor: "#8E8E93",
            tabBarStyle: {
              display: isDesktop ? "none" : "flex",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              borderTopColor: "rgba(0, 0, 0, 0.08)",
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
    backgroundColor: "#FFFFFF",
    position: "relative",
    width: "100%",
    height: "100%",
  },
  sidebar: {
    width: 230,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.08)",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 84, // Clear bottom player
    justifyContent: "space-between",
    zIndex: 10,
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
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#0A0A0A",
  },
  brandSubtitle: {
    fontSize: 11,
    color: "#71717A",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
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
    color: "#A1A1AA",
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
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#71717A",
  },
  navLabelActive: {
    color: "#0A0A0A",
    fontWeight: "700",
  },
  sidebarFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
  },
  engineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  engineText: {
    fontSize: 11,
    color: "#0A0A0A",
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
    height: "100%",
  },
});
