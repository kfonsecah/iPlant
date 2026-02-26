import { StyleSheet } from "react-native";

const colors = {
  background: "#0F1115",
  card: "#151A21",
  border: "#1C222B",
  accent: "#34D399",
  textPrimary: "#E7ECF2",
  textSecondary: "#9EA6B3",
  chip: "#1D2430",
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  settingsIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsText: {
    color: colors.textPrimary,
    fontSize: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginRight: 16,
  },
  nameBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginRight: 10,
  },
  handleText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  privacyPill: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyText: {
    color: colors.accent,
    fontWeight: "600",
    fontSize: 13,
  },
  description: {
    marginTop: 12,
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: 15,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.chip,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  metricCardLast: {
    marginRight: 0,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  metricValue: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 14,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  favoriteName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  subtleText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});
