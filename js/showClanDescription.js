function showClanDescription(clanIndex) {
  const clanId = getClanColumnOrder(state.clanViewMode, state.selectedClan)[clanIndex];
  if (!clanId || !CLANS[clanId]) return;

  state.focusedAbility = {
    type: "clanMelee",
    clanId,
    clanIndex,
  };

  if (typeof renderDetailPanel === "function") {
    renderDetailPanel();
  }
}